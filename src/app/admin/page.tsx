'use client';

import Link from 'next/link';
import { useState } from 'react';
import { marked } from 'marked';
import { categories } from '@/components/CategoryList';
import dynamic from 'next/dynamic';
// リッチテキストエディタをクライアントサイドでのみ読み込む
const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });
import { Article } from '@/types/article';

// ベースとなるカテゴリー型
interface BaseCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

// 管理画面用に拡張したカテゴリー型
interface AdminCategory extends BaseCategory {
  image: string;
  count: number;
}

type CategoryId = BaseCategory['id'];

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState('');
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState<CategoryId>('trouble-cases');
  const [preview, setPreview] = useState<{ title: string; content: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // カテゴリーデータを管理画面用に変換
  const adminCategories: AdminCategory[] = categories.map(cat => ({
    ...cat,
    image: '/images/categories/default.jpg', // デフォルト画像パス
    count: 0  // 初期値
  }));

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // 入力値のバリデーション
      if (!title.trim()) {
        throw new Error('タイトルを入力してください');
      }

      const outlineItems = outline.split('\n').filter(line => line.trim());
      if (outlineItems.length === 0) {
        throw new Error('記事の構成を入力してください');
      }

      const keywordItems = keywords.split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      if (keywordItems.length === 0) {
        throw new Error('キーワードを入力してください');
      }

      const formData = {
        title: title.trim(),
        outline: outlineItems,
        keywords: keywordItems,
        category
      };

      console.log('Sending request with data:', formData);

      // ジョブを作成
      const response = await fetch('/api/articles/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('サーバーからの応答が不正です');
      }

      if (!response.ok) {
        throw new Error(data.error || `エラーが発生しました (${response.status})`);
      }

      if (!data.articleId) {
        throw new Error('記事IDが取得できませんでした');
      }

      const jobId = data.articleId;
      console.log('Article created:', jobId);
      
      // ジョブの状態をポーリング
      let attempts = 0;
      const maxAttempts = 60; // 60回に増やす（約5分）
      const pollingInterval = 5000; // 5秒間隔

      const checkJobStatus = async () => {
        try {
          if (attempts >= maxAttempts) {
            throw new Error('記事生成がタイムアウトしました。時間をおいて再度お試しください。');
          }

          attempts++;
          console.log(`Checking job status (attempt ${attempts}/${maxAttempts})...`);

          const statusResponse = await fetch(`/api/articles/generate?jobId=${jobId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!statusResponse.ok) {
            throw new Error('ジョブの状態確認に失敗しました');
          }

          const statusResponseText = await statusResponse.text();
          console.log('Raw status response:', statusResponseText);

          let status;
          try {
            status = JSON.parse(statusResponseText);
          } catch (e) {
            console.error('Status JSON parse error:', e);
            throw new Error('ジョブ状態の応答が不正です');
          }

          console.log('Parsed job status:', status);
          
          if (status.status === 'completed') {
            if (!status.content) {
              console.warn('Completed status but no content, retrying...');
              await new Promise(resolve => setTimeout(resolve, pollingInterval));
              return checkJobStatus();
            }
            
            try {
              const markedContent = await marked(status.content);
              console.log('Marked content generated successfully');
              
              setPreview({
                title,
                content: markedContent
              });
              setIsGenerating(false);
              return;
            } catch (error) {
              console.error('Error processing markdown:', error);
              throw new Error('記事のプレビュー生成に失敗しました');
            }
          } else if (status.status === 'error') {
            console.error('Generation error:', status.error_message);
            throw new Error(status.error_message || '記事の生成に失敗しました');
          } else if (['generating'].includes(status.status)) {
            console.log(`Generation in progress (${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, pollingInterval));
            return checkJobStatus();
          } else {
            console.warn(`Unexpected job status: ${status.status}`);
            await new Promise(resolve => setTimeout(resolve, pollingInterval));
            return checkJobStatus();
          }
        } catch (error: unknown) {
          console.error('Error checking job status:', error);
          const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
          setIsGenerating(false);
          alert(errorMessage);
        }
      };

      await checkJobStatus();

    } catch (error: unknown) {
      console.error('Error details:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: preview.content,
          category,
          keywords: keywords.split(',').map(k => k.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error('記事の保存に失敗しました');
      }

      alert('記事を保存しました');
      // フォームをリ���ット
      setTitle('');
      setOutline('');
      setKeywords('');
      setCategory('trouble-cases');
      setPreview(null);
    } catch (error) {
      console.error('Error saving article:', error);
      alert('記事の保存にエラーが発生しました。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">管理画面</h1>
        <Link
          href="/admin/articles"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          記事一覧
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">記事構成（1行1見出し）</label>
              <textarea
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                rows={5}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="1. パワハラと？&#13;&#10;2. パワハラの種類&#13;&#10;3. 退職代行を使うメリト"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">カテゴリー</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {adminCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">キーワード (カンマ区切り)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="退職代行 愛知県 即日, 職代行 パワハラ 即退職"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isGenerating ? '生成中...' : '記事を生成'}
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '記事を保存'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">プレビュー</h2>
          {preview && (
            <article className="prose prose-lg max-w-none bg-white">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">{preview.title}</h1>
              <Editor
                initialContent={preview.content}
                onChange={(newContent) => {
                  setPreview({
                    ...preview,
                    content: newContent
                  });
                }}
              />
            </article>
          )}
        </div>
      </div>
    </div>
  );
}