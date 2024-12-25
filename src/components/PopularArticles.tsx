import Link from 'next/link';
import Image from 'next/image';

interface Article {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  views: number;
}

interface PopularArticlesProps {
  articles?: Article[];
}

export default function PopularArticles({ articles = [] }: PopularArticlesProps) {
  if (!articles || articles.length === 0) {
    return null;  // 記事がない場合は何も表示しない
  }

  return (
    <section className="mb-20">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          <span className="text-red-600">よく読まれている</span>
          解決事例
        </h2>
        <Link
          href="/articles"
          className="text-red-600 hover:text-red-700 font-medium"
        >
          すべての事例を見る →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, index) => (
          <Link
            key={article.id}
            href={`/articles/${article.id}`}
            className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-red-100"
          >
            <div className="relative h-48">
              <Image
                src={article.image || '/images/default-article.jpg'}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="inline-block bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  人気 {index + 1}位
                </span>
                <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {article.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600">
                {article.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {article.description}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{article.date}</span>
                <span className="text-red-600 group-hover:translate-x-1 transition-transform duration-200">
                  解決方法を見る →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}