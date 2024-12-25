import { JobStatus } from './queue';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  jobId?: string;
  meta?: LoggerMeta;
  error?: Error | unknown;
}

interface LoggerMeta {
  [key: string]: any;
  jobId?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatError(error: unknown): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      };
    }
    return { message: String(error) };
  }

  private createLogEntry(
    level: LogLevel, 
    message: string, 
    meta?: LoggerMeta | string | Error | unknown,
    error?: Error | unknown
  ): LogEntry {
    const timestamp = new Date().toISOString();
    let jobId: string | undefined;
    let logMeta: LoggerMeta | undefined;
    let logError: Error | unknown | undefined;

    // メタデータとエラーの処理
    if (meta instanceof Error || (error === undefined && typeof meta !== 'string' && typeof meta !== 'object')) {
      logError = meta;
    } else if (typeof meta === 'string') {
      jobId = meta;
    } else if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
      logMeta = meta as LoggerMeta;
      jobId = logMeta.jobId;
      if (jobId) {
        const { jobId: _, ...rest } = logMeta;
        logMeta = rest;
      }
    }

    if (error !== undefined) {
      logError = error;
    }

    const entry: LogEntry = {
      timestamp,
      level,
      message,
      jobId,
      meta: logMeta,
      error: logError ? this.formatError(logError) : undefined,
    };

    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // コンソールにも出力
    const logMessage = `[${timestamp}] ${level.toUpperCase()} ${jobId ? `[Job: ${jobId}] ` : ''}${message}`;
    const logData = logMeta ? JSON.stringify(logMeta, null, 2) : '';
    const logErrorStr = logError ? `\n${JSON.stringify(this.formatError(logError), null, 2)}` : '';

    switch (level) {
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(logMessage, logData, logErrorStr);
        }
        break;
      case 'info':
        console.info(logMessage, logData, logErrorStr);
        break;
      case 'warn':
        console.warn(logMessage, logData, logErrorStr);
        break;
      case 'error':
        console.error(logMessage, logData, logErrorStr);
        break;
    }

    return entry;
  }

  debug(message: string, meta?: LoggerMeta | string) {
    return this.createLogEntry('debug', message, meta);
  }

  info(message: string, meta?: LoggerMeta | string) {
    return this.createLogEntry('info', message, meta);
  }

  warn(message: string, meta?: LoggerMeta | string, error?: Error | unknown) {
    return this.createLogEntry('warn', message, meta, error);
  }

  error(message: string, error?: Error | unknown, meta?: LoggerMeta | string) {
    return this.createLogEntry('error', message, meta, error);
  }

  getJobLogs(jobId: string): LogEntry[] {
    return this.logs.filter(log => log.jobId === jobId);
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  getLogsByLevel(level: LogLevel, count: number = 100): LogEntry[] {
    return this.logs.filter(log => log.level === level).slice(-count);
  }

  clearLogs() {
    this.logs = [];
  }

  // ジョブの状態変更を記録
  logJobStateChange(jobId: string, oldState: string, newState: string, meta?: LoggerMeta) {
    this.info(`Job state changed from ${oldState} to ${newState}`, { jobId, oldState, newState, ...meta });
  }

  // Redis操作を記録
  logRedisOperation(operation: string, success: boolean, meta?: LoggerMeta) {
    if (success) {
      this.debug(`Redis operation succeeded: ${operation}`, meta);
    } else {
      this.error(`Redis operation failed: ${operation}`, meta);
    }
  }

  // API呼び出しを記録
  logApiCall(api: string, success: boolean, meta?: LoggerMeta) {
    if (success) {
      this.debug(`API call succeeded: ${api}`, meta);
    } else {
      this.error(`API call failed: ${api}`, meta);
    }
  }
}

export const logger = Logger.getInstance(); 