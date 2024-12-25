import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';
import { generateArticle } from '@/lib/article';
import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Redis接続の設定
const getRedisClient = () => {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
  });
};

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  try {
    logger.info('ワーカーリクエストを受信', {
      timestamp: new Date().toISOString()
    });

    // Redisの接続状態を確認
    const redis = getRedisClient();
    try {
      const pong = await redis.ping();
      logger.info('Redis接続が正常です', { pong });
    } catch (error) {
      logger.error('Redis接続エラー', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error('Redis connection failed');
    }

    // 生成中の記事を取得
    const { data: articles, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('status', 'generating')
      .order('created_at', { ascending: true })
      .limit(5);

    if (fetchError) {
      throw fetchError;
    }

    // 待機中の記事を処理
    if (articles && articles.length > 0) {
      logger.info('待機中の記事を処理します', {
        count: articles.length,
        timestamp: new Date().toISOString()
      });
      
      for (const article of articles) {
        logger.info('記事の処理を開始します', {
          articleId: article.id,
          timestamp: new Date().toISOString()
        });

        try {
          // 記事を直接処理
          const result = await generateArticle({
            title: article.title,
            category: article.category,
            keywords: article.keywords,
            outline: article.outline || []
          });
          
          // 記事を更新
          const { error: updateError } = await supabaseAdmin
            .from('articles')
            .update({
              content: result.content,
              description: result.metadata.description,
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', article.id);

          if (updateError) {
            throw updateError;
          }
          
          logger.info('記事が完了しました', {
            articleId: article.id,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          logger.error('記事の処理に失敗', {
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
        }
      }
    }

    // 記事の状態を集計
    const [
      { count: activeCount },
      { count: waitingCount },
      { count: completedCount },
      { count: failedCount }
    ] = await Promise.all([
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'generating'),
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'waiting'),
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'error')
    ]);

    logger.info('記事の状態', {
      activeCount,
      waitingCount,
      completedCount,
      failedCount,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      status: 'success',
      articles: {
        activeCount,
        waitingCount,
        completedCount,
        failedCount
      }
    });
  } catch (error) {
    logger.error('ワーカーの実行中にエラーが発生', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 