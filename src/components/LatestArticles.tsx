import React from 'react';
import { Article } from '@/types/article';

interface LatestArticlesProps {
  articles: Article[];
}

const LatestArticles: React.FC<LatestArticlesProps> = ({ articles }) => {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">最新の記事</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((article) => (
          <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{article.description}</p>
              <a
                href={`/articles/${article.id}`}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                続きを読む →
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default LatestArticles;