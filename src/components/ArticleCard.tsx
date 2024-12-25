import Link from 'next/link';
import { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/articles/${article.id}`}>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {article.description}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <time dateTime={article.createdAt}>
              {new Date(article.createdAt).toLocaleDateString('ja-JP')}
            </time>
            {article.category && (
              <>
                <span className="mx-2">•</span>
                <span className="text-blue-600">{article.category}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
} 