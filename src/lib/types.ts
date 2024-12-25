import { z } from 'zod';

// ジョブステータスの型定義
export type JobStatusType = 'waiting' | 'generating' | 'completed' | 'failed' | 'error';

// ジョブ結果の型定義
export interface JobResult {
  title: string;
  content: string;
  summary: string;
}

// ジョブデータの型定義
export interface JobData {
  prompt?: string;
  title?: string;
  outline?: string[];
  keywords?: string[];
  category?: string;
  status: JobStatusType;
  result?: JobResult;
  error?: string;
}

// ジョブの型定義
export interface Job {
  id: string;
  name: string;
  data: JobData;
  status: JobStatusType;
  createdAt: string;
  progress?: number;
  result?: JobResult;
  error?: string;
}

// ジョブ状態の型定義
export interface JobStatus {
  id: string;
  status: JobStatusType;
  progress: number;
  result?: JobResult;
  error?: string;
  data?: JobData;
} 