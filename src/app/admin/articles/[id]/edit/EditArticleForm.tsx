'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Article } from '@/types/article';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

export default function EditArticleForm({ article: initialArticle }: { article: Article }) {
  const [article, setArticle] = useState(initialArticle);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  // 記事保存
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });

      if (!response.ok) throw new Error('更新に失敗しました');
      router.push('/admin/articles');
    } catch (error) {
      console.error('保存中にエラーが発生しました:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // 画像アップロード
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('画像のアップロードに失敗しました');

      const data = await response.json();
      setArticle({ ...article, image: data.url });
    } catch (error) {
      console.error('画像のアップロード中にエラーが発生しました:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">記事の編集</h1>
      <div className="space-y-6">
        {/* サムネイル画像 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            サムネイル画像
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {article.image && (
              <div className="relative w-32 h-32">
                <Image
                  src={article.image}
                  alt="Article thumbnail"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              {isUploading ? 'アップロード中...' : '画像を選択'}
            </label>
          </div>
        </div>

        {/* タイトル編集 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タイトル
          </label>
          <input
            type="text"
            value={article.title}
            onChange={(e) =>
              setArticle({ ...article, title: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* 本文編集 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            本文
          </label>
          <Editor
            initialContent={article.content}
            onChange={(content) => setArticle({ ...article, content })}
          />
        </div>

        {/* 操作ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  );
} 