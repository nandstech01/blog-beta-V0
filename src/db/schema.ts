export const validJobStatuses = ['pending', 'processing', 'completed', 'failed'] as const;
export type JobStatus = typeof validJobStatuses[number];

// 型定義
export type Article = {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string;
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: string;
  status: JobStatus;
  data: string;
  result?: string;
  error?: string;
  progress?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
};