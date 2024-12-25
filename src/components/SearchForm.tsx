'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { serverCategories } from '@/lib/categories';

interface SearchFormProps {
  initialQuery?: string;
  initialCategory?: string;
}

export default function SearchForm({ initialQuery = '', initialCategory = 'すべて' }: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (query.trim()) {
      searchParams.set('q', query);
    }
    if (category !== 'すべて') {
      searchParams.set('category', category);
    }
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キーワードを入力..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="すべて">すべてのカテゴリー</option>
            {serverCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          検索
        </button>
      </div>
    </form>
  );
}