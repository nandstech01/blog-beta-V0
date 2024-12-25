'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Article } from '@/types/article';

export default function EditArticleForm({ article }: { article: Article }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.get('title'),
          category: formData.get('category'),
          content: formData.get('content'),
        }),
      });

      if (!response.ok) {
        throw new Error('記事の更新に失敗しました');
      }

      alert('記事を更新しました');
      router.push('/admin/articles');
    } catch (error) {
      console.error('更新エラー:', error);
      alert(error instanceof Error ? error.message : '記事の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">記事の編集</h1>
      <form onSubmit={handleSubmit}>
        {/* フォームの内容は以前と同じ */}
      </form>
    </div>
  );
} 