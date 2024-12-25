import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { updateJobStatus } from '@/lib/queue';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateArticle(topic: string, jobId: string) {
  try {
    logger.info('記事生成を開始します', { topic, jobId });
    
    // 初期状態を'generating'に設定
    await updateJobStatus(jobId, 'generating', 0);
    
    // OpenAI APIの呼び出し前
    await updateJobStatus(jobId, 'generating', 25);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたはブログ記事を書くライターです。与えられたトピックについて、日本語で500文字程度の記事を書いてください。"
        },
        {
          role: "user",
          content: topic
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // OpenAI APIの呼び出し後
    await updateJobStatus(jobId, 'generating', 50);
    
    const article = completion.choices[0].message.content;
    
    if (!article) {
      throw new Error('OpenAIからの応答が空でした');
    }

    logger.info('記事生成が完了しました', { jobId });
    await updateJobStatus(jobId, 'generating', 75);

    const { error: insertError } = await supabase
      .from('articles')
      .insert([
        {
          topic,
          content: article,
          job_id: jobId,
        },
      ]);

    if (insertError) {
      throw insertError;
    }

    logger.info('記事をデータベースに保存しました', { jobId });
    await updateJobStatus(jobId, 'completed', 100, { content: article });
    
    return article;
  } catch (error) {
    logger.error('記事生成中にエラーが発生しました', {
      error: error instanceof Error ? error.message : String(error),
      jobId,
    });
    await updateJobStatus(
      jobId,
      'failed',
      0,
      null,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
} 