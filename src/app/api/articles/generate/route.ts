import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { Anthropic } from '@anthropic-ai/sdk';

// レスポンスの型定義
interface GenerateArticleResponse {
  articleId: string;
  status: 'generating' | 'error' | 'completed';
  error?: string;
  details?: unknown;
}

// 入力データのバリデーションスキーマ
const generateArticleSchema = z.object({
  title: z.string().min(1, '記事タイトルは必須です'),
  category: z.string().min(1, 'カテゴリーは必須です'),
  keywords: z.array(z.string()).min(1, 'キーワードは必須です'),
});

export async function POST(req: Request): Promise<NextResponse<GenerateArticleResponse>> {
  try {
    const data = await req.json();
    logger.info('記事生成リクエストを受信', { data });

    // 入力データのバリデーション
    const validationResult = generateArticleSchema.safeParse(data);
    if (!validationResult.success) {
      logger.warn('入力データのバリデーションに失敗', { 
        errors: validationResult.error.errors 
      });
      return NextResponse.json({
        status: 'error',
        error: 'Invalid input data',
        details: validationResult.error.errors
      } as GenerateArticleResponse, { status: 400 });
    }

    // APIキーの確認
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        status: 'error',
        error: 'ANTHROPIC_API_KEY is not configured'
      } as GenerateArticleResponse, { status: 500 });
    }

    // 1. 記事エントリの作成
    const { data: article, error: insertError } = await supabaseAdmin
      .from('articles')
      .insert({
        title: validationResult.data.title,
        category: validationResult.data.category,
        keywords: validationResult.data.keywords,
        status: 'generating',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      logger.error('記事エントリの作成に失敗', insertError);
      return NextResponse.json({
        status: 'error',
        error: 'Failed to create article entry'
      } as GenerateArticleResponse, { status: 500 });
    }

    // 2. 記事生成を開始
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    try {
      // アウトライン生成
      logger.info('アウトライン生成を開始', { articleId: article.id });
      const outlineResponse = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Create a detailed outline for an article about ${validationResult.data.title}.
                    Category: ${validationResult.data.category}
                    Keywords: ${validationResult.data.keywords.join(', ')}
                    
                    The outline should include:
                    1. Introduction
                    2. 3-4 main sections
                    3. Conclusion`
        }]
      });

      const outline = outlineResponse.content[0].text;
      logger.info('アウトライン生成完了', { articleId: article.id, outline });

      // 本文生成
      logger.info('本文生成を開始', { articleId: article.id });
      const contentResponse = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Write a detailed article based on this outline:
                    ${outline}
                    
                    Title: ${validationResult.data.title}
                    Category: ${validationResult.data.category}
                    Keywords: ${validationResult.data.keywords.join(', ')}
                    
                    Requirements:
                    1. Write in a professional tone
                    2. Include practical examples
                    3. Minimum 4000 characters
                    4. Format with proper markdown headings
                    5. Focus on providing value to readers`
        }]
      });

      const content = contentResponse.content[0].text;
      logger.info('本文生成完了', { articleId: article.id, contentLength: content.length });

      // 記事を更新
      const { error: updateError } = await supabaseAdmin
        .from('articles')
        .update({
          content,
          outline,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (updateError) {
        throw updateError;
      }

      logger.info('記事生成完了', { articleId: article.id });

      return NextResponse.json({
        articleId: article.id,
        status: 'completed'
      } as GenerateArticleResponse);

    } catch (error) {
      logger.error('記事生成に失敗', {
        articleId: article.id,
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー状態を保存
      await supabaseAdmin
        .from('articles')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : '不明なエラー',
          completed_at: new Date().toISOString()
        })
        .eq('id', article.id);

      return NextResponse.json({
        articleId: article.id,
        status: 'error',
        error: error instanceof Error ? error.message : '不明なエラー'
      } as GenerateArticleResponse, { status: 500 });
    }

  } catch (error) {
    logger.error('記事生成リクエストの処理中にエラー', error);
    return NextResponse.json({
      status: 'error',
      error: 'Internal server error'
    } as GenerateArticleResponse, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // 記事の状態を取得
    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      logger.error('記事の取得に失敗', error);
      return NextResponse.json(
        { error: 'Failed to fetch article status' },
        { status: 500 }
      );
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: article.id,
      status: article.status,
      error: article.error_message,
      content: article.content,
      createdAt: article.created_at,
      completedAt: article.completed_at
    });

  } catch (error) {
    logger.error('記事状態の取得中にエラー', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 