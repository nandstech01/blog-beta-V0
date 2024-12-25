'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@/components/Editor';

interface GenerateResponse {
  jobId: string;
}

interface JobStatus {
  id: string;
  status: string;
  progress: number;
  result?: any;
  error?: string;
  data?: any;
}

export default function NewArticlePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState('');
  const router = useRouter();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      // 記事生成ジョブを作成
      const response = await fetch('/api/worker/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '「退職代行サービス完全ガイド：選び方から利用方法まで徹底解説」',
          outline: [
            'h2: 退職代行サービスの概要と特徴',
            'h3: 退職代行とは？',
            'h4: サービスが提供する具体的なサポート内容',
            'h4: 利用者が増加している理由とは',
            'h3: 退職代行を利用するメリットとデメリット',
            'h4: スムーズな退職ができるメリット',
            'h4: 利用時に注意すべきデメリット',
            'h2: 退職代行サービスの料金相場と選び方',
            'h3: 退職代行サービスの料金相場はどのくらい？',
          ],
          keywords: ['滋賀県'],
          category: 'trouble-cases',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate article');
      }

      const data: GenerateResponse = await response.json();
      console.log('Raw response:', JSON.stringify(data));
      console.log('Job created:', data.jobId);

      // ジョブのステータスをポーリング
      let attempts = 0;
      const MAX_STATUS_CHECKS = 60; // 5分間のタイムアウト (5秒 × 60回)
      const STATUS_CHECK_INTERVAL = 5000; // 5秒間隔

      while (attempts < MAX_STATUS_CHECKS) {
        attempts++;
        console.log(`Checking job status (attempt ${attempts}/${MAX_STATUS_CHECKS})...`);

        try {
          const statusResponse = await fetch(`/api/worker/status/${data.jobId}`);
          if (!statusResponse.ok) {
            console.error('Status check failed:', await statusResponse.text());
            throw new Error('Failed to check job status');
          }

          const statusText = await statusResponse.text();
          console.log('Raw status response:', statusText);

          const status: JobStatus = JSON.parse(statusText);
          console.log('Parsed job status:', status);

          if (status.error) {
            throw new Error(status.error);
          }

          // 完了状態の判定を改善
          if (status.status === 'completed' && status.result && status.result.content) {
            setContent(status.result.content);
            break;
          }

          if (status.status === 'failed') {
            throw new Error(status.error || 'Job failed');
          }

          // 進行中の状態チェック
          if (status.status === 'active') {
            if (status.progress === 100 && status.result && status.result.content) {
              setContent(status.result.content);
              break;
            }
            // まだ完了していない場合は待機
            await new Promise(resolve => setTimeout(resolve, STATUS_CHECK_INTERVAL));
            continue;
          }

          // その他の状態の場合も待機
          await new Promise(resolve => setTimeout(resolve, STATUS_CHECK_INTERVAL));
        } catch (error) {
          console.error('Error checking job status:', error);
          // エラーが発生しても即座に失敗とせず、再試行する
          await new Promise(resolve => setTimeout(resolve, STATUS_CHECK_INTERVAL));
        }
      }

      if (attempts >= MAX_STATUS_CHECKS) {
        throw new Error('Timeout waiting for job completion');
      }
    } catch (error) {
      console.error('Error checking job status:', error);
      console.error('Error details:', error);
      alert('記事の生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '記事タイトル',
          content,
          category: 'trouble-cases',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save article');
      }

      router.push('/admin/articles');
    } catch (error) {
      console.error('Error saving article:', error);
      alert('記事の保存に失敗しました');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">新規記事作成</h1>
        <div className="space-x-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isGenerating ? '生成中...' : '記事を生成'}
          </button>
          <button
            onClick={handleSave}
            disabled={!content}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            保存
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <Editor
          initialContent={content}
          onChange={newContent => setContent(newContent)}
        />
      </div>
    </div>
  );
} 