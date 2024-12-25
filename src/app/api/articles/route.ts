import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { queue, QUEUE_NAME } from '@/lib/queue';
import { Redis } from '@upstash/redis';

const articleSchema = z.object({
  title: z.string(),
  outline: z.array(z.string()),
  keywords: z.array(z.string()),
  category: z.string(),
});

// Upstash Redis REST API接続
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL?.replace('redis://', 'https://') || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

// 記事の作成
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    logger.info('記事生成リクエストを受信', data);

    // バリデーション
    const validatedData = articleSchema.parse(data);

    logger.info('Supabaseに記事を作成開始', {
      title: validatedData.title,
      category: validatedData.category
    });

    // 記事レコードを作成
    const { data: article, error: insertError } = await supabaseAdmin
      .from('articles')
      .insert({
        title: validatedData.title,
        outline: JSON.stringify(validatedData.outline),
        keywords: validatedData.keywords,
        category: validatedData.category,
        status: 'generating'
      })
      .select()
      .single();

    if (insertError || !article) {
      logger.error('記事の作成に失敗', {
        error: insertError,
        data: validatedData
      });
      return NextResponse.json(
        { error: 'Failed to create article' },
        { status: 500 }
      );
    }

    logger.info('記事を作成しました', {
      articleId: article.id,
      title: article.title
    });

    // キューにジョブを追加
    const { nanoid } = await import('nanoid');
    const jobId = nanoid();
    const job = await queue.add(QUEUE_NAME, {
      title: validatedData.title,
      outline: validatedData.outline,
      keywords: validatedData.keywords,
      category: validatedData.category,
      status: 'generating'
    }, { jobId });

    logger.info('キューにジョブを追加しました', {
      jobId: job.id,
      articleId: article.id
    });

    return NextResponse.json({
      articleId: article.id,
      status: 'generating'
    });
  } catch (error) {
    logger.error('記事生成リクエストの処理中にエラーが発生', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 記事の状態確認
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching article status:', error);
      return NextResponse.json(
        { error: 'Failed to fetch article status' },
        { status: 500 }
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
    logger.error('Error in status check:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}