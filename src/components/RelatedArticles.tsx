'use client';

import Link from 'next/link';
import { Article } from '@/types/article';

interface RelatedArticlesProps {
  currentArticleId: string;
  categoryId: string;
  articles?: Article[];
}

export default function RelatedArticles({ 
  currentArticleId, 
  categoryId,
  articles = [] 
}: RelatedArticlesProps) {
  // 現在の記事を除外し、3件までに制限
  const relatedArticles = articles
    .filter(article => article.id !== currentArticleId)
    .slice(0, 3);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {relatedArticles.map((article) => (
        <article key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
          {article.image && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
              <Link href={`/articles/${article.id}`} className="hover:text-red-600">
                {article.title}
              </Link>
            </h3>
            <time className="block mt-2 text-sm text-gray-500">
              {new Date(article.createdAt).toLocaleDateString()}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
}