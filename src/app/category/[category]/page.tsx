import { getArticlesByCategory } from '@/lib/articles';
import Link from 'next/link';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const articles = await getArticlesByCategory(category);

  if (!articles || articles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          カテゴリー: {decodeURIComponent(category)}
        </h1>
        <p>このカテゴリーの記事はありません。</p>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
        >
          トップページに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        カテゴリー: {decodeURIComponent(category)}
      </h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <article key={article.id} className="border-b pb-6">
            <Link href={`/articles/${article.id}`}>
              <h2 className="text-xl font-semibold hover:text-blue-600">
                {article.title}
              </h2>
            </Link>
            <div className="text-sm text-gray-500 mt-2">
              {new Date(article.createdAt).toLocaleDateString('ja-JP')}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}