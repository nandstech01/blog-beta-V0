import { getArticleById } from '@/lib/articles';
import Link from 'next/link';

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    return <div>記事が見つかりません</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">記事の詳細</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">タイトル</h2>
          <p>{article.title}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">カテゴリー</h2>
          <p>{article.category}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">本文</h2>
          <p>{article.content}</p>
        </div>
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/articles"
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            戻る
          </Link>
          <Link
            href={`/admin/articles/${id}/edit`}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            編集
          </Link>
        </div>
      </div>
    </div>
  );
} 