import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { Anthropic } from '@anthropic-ai/sdk';
import { queue, QUEUE_NAME } from '@/lib/queue';
import { Job, JobData, JobResult } from '@/lib/types';

// 記事生成処理
export async function processArticleJob(job: Job) {
  const { title, category, keywords, outline: existingOutline } = job.data;

  // 必須パラメータのチェック
  if (!title) {
    throw new Error('Title is required');
  }

  try {
    logger.info('記事生成を開始', {
      jobId: job.id,
      title
    });

    // ジョブの進捗を更新
    await queue.updateJobStatus(job.id, 'generating', 10);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // 1. アウトライン生成（既存のアウトラインがない場合のみ）
    let outline: string[] = existingOutline || [];
    if (outline.length === 0) {
      logger.info('アウトライン生成を開始', { jobId: job.id });
      const outlineResponse = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Create a detailed outline for an article about ${title}.
                    Category: ${category || 'General'}
                    Keywords: ${keywords?.join(', ') || 'None'}
                    
                    The outline should include:
                    1. Introduction
                    2. 3-4 main sections
                    3. Conclusion`
        }]
      });

      const outlineText = outlineResponse.content[0].text;
      // アウトラインテキストを行ごとに分割して配列に変換
      outline = outlineText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      logger.info('アウトライン生成完了', { jobId: job.id, outline });
    }

    // ジョブの進捗を更新
    await queue.updateJobStatus(job.id, 'generating', 40);

    // 2. 本文生成
    logger.info('本文生成を開始', { jobId: job.id });
    const contentResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Write a detailed article based on this outline:
                  ${outline.join('\n')}
                  
                  Title: ${title}
                  Category: ${category || 'General'}
                  Keywords: ${keywords?.join(', ') || 'None'}
                  
                  Requirements:
                  1. Write in a professional tone
                  2. Include practical examples
                  3. Minimum 4000 characters
                  4. Format with proper markdown headings
                  5. Focus on providing value to readers`
      }]
    });

    const content = contentResponse.content[0].text;
    if (!content) {
      throw new Error('Generated content is empty');
    }

    logger.info('本文生成完了', { jobId: job.id, contentLength: content.length });

    // ジョブの進捗を更新
    await queue.updateJobStatus(job.id, 'generating', 80);

    // 3. 記事を更新
    const { error: updateError } = await supabaseAdmin
      .from('articles')
      .update({
        content,
        outline: JSON.stringify(outline),
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', job.id);

    if (updateError) {
      throw updateError;
    }

    // ジョブを完了状態に更新
    const result: JobResult = {
      title: title,
      content: content,
      summary: outline.join('\n')
    };

    await queue.updateJobStatus(job.id, 'completed', 100, result);

    logger.info('記事生成完了', { jobId: job.id });
    return { success: true };

  } catch (error) {
    logger.error('記事生成に失敗', {
      jobId: job.id,
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
      .eq('id', job.id);

    // ジョブをエラー状態に更新
    await queue.updateJobStatus(
      job.id,
      'failed',
      0,
      undefined,
      error instanceof Error ? error.message : '不明なエラー'
    );

    throw error;
  }
}

// ワーカーの初期化と実行
export async function startWorker() {
  try {
    logger.info('ワーカーを開始します');

    while (true) {
      // 待機中のジョブを取得
      const jobs = await queue.getWaiting();
      
      for (const job of jobs) {
        try {
          await processArticleJob(job);
        } catch (error) {
          logger.error('ジョブの処理に失敗', {
            jobId: job.id,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      // 1秒待機してから次のポーリング
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    logger.error('ワーカーの実行中にエラーが発生', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
} 