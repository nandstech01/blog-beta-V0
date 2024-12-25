'use client';

import { useEffect, useState } from 'react';
import { Article } from '@/types';
import { getArticlesBySearch } from '@/lib/articles';
import ArticleCard from './ArticleCard';
import Pagination from './Pagination';
import Loading from './Loading';

interface SearchResultsProps {
  query: string;
  category: string;
  page: number;
}

export default function SearchResults({ query, category, page }: SearchResultsProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const { articles: results, totalPages: total } = await getArticlesBySearch(query, category, page);
        setArticles(results);
        setTotalPages(total);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
      setLoading(false);
    }

    fetchResults();
  }, [query, category, page]);

  if (loading) {
    return <Loading />;
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">検索結果が見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {articles.map((article: Article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl={`/search?q=${encodeURIComponent(query)}${category !== 'すべて' ? `&category=${encodeURIComponent(category)}` : ''}`}
        />
      )}
    </div>
  );
} 