import { logger } from './logger';
import { JobData, JobStatus, JobStatusType, JobResult, API_BASE_URL } from './queue';
import Anthropic from '@anthropic-ai/sdk';
import { updateJobStatus } from './queue';

// 定数の定義
const CONSTANTS = {
  TIMEOUT_MS: 290000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000,
  MAX_TOKENS: 2000,
} as const;

// 進捗状態の定義
const PROGRESS_STATES = {
  STARTED: 10,
  FIRST_HALF_COMPLETED: 30,
  CONTENT_GENERATED: 50,
  COMPLETED: 100,
} as const;

// エラーの定義
class ArticleGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: keyof typeof ERROR_CODES,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ArticleGenerationError';
  }
}

const ERROR_CODES = {
  INVALID_API_KEY: 'INVALID_API_KEY',
  API_QUOTA_EXCEEDED: 'API_QUOTA_EXCEEDED',
  API_SERVER_ERROR: 'API_SERVER_ERROR',
  CONTENT_GENERATION_FAILED: 'CONTENT_GENERATION_FAILED',
  SAVE_FAILED: 'SAVE_FAILED',
  TIMEOUT: 'TIMEOUT',
  UNEXPECTED: 'UNEXPECTED',
} as const;

const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_API_KEY]: 'Claude APIキーが無効です。システム管理者に連絡してください。',
  [ERROR_CODES.API_QUOTA_EXCEEDED]: 'Claude APIの利用制限に達しました。1時間後に再試行してください。',
  [ERROR_CODES.API_SERVER_ERROR]: 'Claude APIサーバーでエラーが発生しました。しばらく待ってから再試行してください。',
  [ERROR_CODES.CONTENT_GENERATION_FAILED]: '記事の生成に失敗しました。再試行してください。',
  [ERROR_CODES.SAVE_FAILED]: '記事の保存に失敗しました。',
  [ERROR_CODES.TIMEOUT]: '処理がタイムアウトしました。',
  [ERROR_CODES.UNEXPECTED]: '予期せぬエラーが発生しました。',
} as const;

// APIクライアント管理
class AnthropicClientManager {
  private static instance: Anthropic | null = null;
  private static lastValidated: number = 0;
  private static readonly VALIDATION_INTERVAL_MS = 300000;

  static getInstance(): Anthropic {
    if (!this.instance || Date.now() - this.lastValidated > this.VALIDATION_INTERVAL_MS) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey?.trim()) {
        throw new ArticleGenerationError(
          ERROR_MESSAGES[ERROR_CODES.INVALID_API_KEY],
          ERROR_CODES.INVALID_API_KEY
        );
      }
      this.instance = new Anthropic({ apiKey });
      this.lastValidated = Date.now();
      logger.info('Anthropicクライアントを初期化しました');
    }
    return this.instance;
  }

  static handleError(error: unknown): never {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Claude APIエラー', { error: errorMessage });

    if (errorMessage.includes('401')) {
      throw new ArticleGenerationError(
        ERROR_MESSAGES[ERROR_CODES.INVALID_API_KEY],
        ERROR_CODES.INVALID_API_KEY
      );
    } else if (errorMessage.includes('429') || errorMessage.includes('rate_limit_exceeded')) {
      throw new ArticleGenerationError(
        ERROR_MESSAGES[ERROR_CODES.API_QUOTA_EXCEEDED],
        ERROR_CODES.API_QUOTA_EXCEEDED
      );
    } else if (errorMessage.includes('500')) {
      throw new ArticleGenerationError(
        ERROR_MESSAGES[ERROR_CODES.API_SERVER_ERROR],
        ERROR_CODES.API_SERVER_ERROR
      );
    }
    throw new ArticleGenerationError(
      ERROR_MESSAGES[ERROR_CODES.UNEXPECTED],
      ERROR_CODES.UNEXPECTED,
      { originalError: errorMessage }
    );
  }
}

// 記事生成の本体
async function generateArticleContent(data: JobData, jobId: string): Promise<string> {
  const anthropic = AnthropicClientManager.getInstance();
  let fullContent = '';

  try {
    logger.info('記事生成を開始します', { jobId, title: data.title });
    await updateJobStatus(jobId, 'active', PROGRESS_STATES.STARTED);

    // アウトラインを2つのグループに分割
    const midPoint = Math.ceil(data.outline.length / 2);
    const firstHalf = data.outline.slice(0, midPoint);
    const secondHalf = data.outline.slice(midPoint);

    // 最初の部分の生成
    logger.info('記事前半部分の生成を開始', { jobId, outlineCount: firstHalf.length });
    const firstPrompt = `
「${data.title}」について、${data.keywords[0]}の読者向けの記事の前半部分を書いてください。

以下のアウトラインに沿って、具体的な情報と実用的なアドバイスを含めてください：

${firstHalf.join('\n')}`;

    const firstResponse = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: CONSTANTS.MAX_TOKENS,
      messages: [{ role: "user", content: [{ type: "text", text: firstPrompt }] }],
      temperature: 0.3
    });

    if (!firstResponse.content?.[0]?.text) {
      throw new ArticleGenerationError(
        '記事前半部分の生成に失敗しました',
        ERROR_CODES.CONTENT_GENERATION_FAILED
      );
    }

    fullContent = firstResponse.content[0].text.trim();
    await updateJobStatus(jobId, 'active', 30);

    // 後半部分の生成
    logger.info('記事後半部分の生成を開始', { jobId, outlineCount: secondHalf.length });
    const secondPrompt = `
前半部分に続く、「${data.title}」の後半部分を書いてください。
前半部分の内容は以下の通りです：

${fullContent.substring(0, 200)}...

以下のアウトラインに沿って、前半部分と自然に繋がるように書いてください：

${secondHalf.join('\n')}`;

    const secondResponse = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: CONSTANTS.MAX_TOKENS,
      messages: [{ role: "user", content: [{ type: "text", text: secondPrompt }] }],
      temperature: 0.3
    });

    if (!secondResponse.content?.[0]?.text) {
      throw new ArticleGenerationError(
        '記事後半部分の生成に失敗しました',
        ERROR_CODES.CONTENT_GENERATION_FAILED
      );
    }

    fullContent += '\n\n' + secondResponse.content[0].text.trim();
    logger.info('記事生成が完了しました', { 
      jobId,
      contentLength: fullContent.length,
      firstFewWords: fullContent.substring(0, 50)
    });

    await updateJobStatus(jobId, 'active', PROGRESS_STATES.CONTENT_GENERATED);

    return fullContent;
  } catch (error) {
    logger.error('記事生成中にエラーが発生', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof ArticleGenerationError) {
      throw error;
    }
    return AnthropicClientManager.handleError(error);
  }
}

// 記事の保存
async function saveArticle(
  article: { title: string; content: string; category: string; keywords: string[]; },
  jobId: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ArticleGenerationError(
        `記事の保存に失敗: ${response.statusText} - ${errorText}`,
        ERROR_CODES.SAVE_FAILED
      );
    }

    logger.info('記事を保存しました', { articleId: article.title });
  } catch (error) {
    throw new ArticleGenerationError(
      ERROR_MESSAGES[ERROR_CODES.SAVE_FAILED],
      ERROR_CODES.SAVE_FAILED,
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}

// メイン処理
export async function generateArticle(data: JobData, jobId: string): Promise<JobResult> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      logger.error('記事生成がタイムアウトしました', { jobId, timeout: CONSTANTS.TIMEOUT_MS });
      reject(new ArticleGenerationError(
        ERROR_MESSAGES[ERROR_CODES.TIMEOUT],
        ERROR_CODES.TIMEOUT
      ));
    }, CONSTANTS.TIMEOUT_MS);
  });

  try {
    logger.info('記事生成プロセスを開始', { 
      jobId,
      title: data.title,
      category: data.category,
      keywordsCount: data.keywords.length,
      outlineLength: data.outline.length
    });

    const generatePromise = (async () => {
      let content: string | undefined;
      let retryCount = 0;

      while (retryCount < CONSTANTS.MAX_RETRIES) {
        try {
          content = await generateArticleContent(data, jobId);
          break;
        } catch (error) {
          logger.error('記事生成の試行が失敗', {
            jobId,
            retryCount,
            error: error instanceof Error ? error.message : String(error)
          });

          if (error instanceof ArticleGenerationError) {
            if (error.code === ERROR_CODES.API_QUOTA_EXCEEDED) {
              await updateJobStatus(jobId, 'failed', 0, undefined, error.message);
              throw error;
            }
          }

          retryCount++;
          if (retryCount >= CONSTANTS.MAX_RETRIES) {
            throw error;
          }

          logger.warn('記事生成を再試行します', {
            retryCount,
            maxRetries: CONSTANTS.MAX_RETRIES,
            error: error instanceof Error ? error.message : String(error)
          });

          await new Promise(resolve => setTimeout(resolve, CONSTANTS.RETRY_DELAY_MS));
        }
      }

      if (!content) {
        logger.error('すべての試行が失敗しました', { jobId, retryCount: CONSTANTS.MAX_RETRIES });
        throw new ArticleGenerationError(
          ERROR_MESSAGES[ERROR_CODES.CONTENT_GENERATION_FAILED],
          ERROR_CODES.CONTENT_GENERATION_FAILED
        );
      }

      const description = `${data.title}に関する記事です。${data.keywords.join('、')}の情報を提供しています。`;

      logger.info('記事を保存します', { jobId, contentLength: content.length });
      await saveArticle({
        title: data.title,
        content,
        category: data.category,
        keywords: data.keywords,
      }, jobId);

      await updateJobStatus(jobId, 'completed', PROGRESS_STATES.COMPLETED, {
        content,
        description
      });

      logger.info('記事生成プロセスが完了', {
        jobId,
        title: data.title,
        contentLength: content.length
      });

      return { content, description };
    })();

    return await Promise.race([generatePromise, timeoutPromise]);
  } catch (error) {
    const articleError = error instanceof ArticleGenerationError ? error :
      new ArticleGenerationError(
        ERROR_MESSAGES[ERROR_CODES.UNEXPECTED],
        ERROR_CODES.UNEXPECTED,
        { originalError: error instanceof Error ? error.message : String(error) }
      );

    logger.error('記事生成プロセスでエラーが発生', {
      jobId,
      error: articleError.message,
      code: articleError.code,
      details: articleError.details,
      stack: error instanceof Error ? error.stack : undefined
    });

    await updateJobStatus(jobId, 'failed', 0, undefined, articleError.message);
    throw articleError;
  }
} 