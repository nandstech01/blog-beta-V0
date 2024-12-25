'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="退職のお悩みを検索"
            className={`search-input ${
              isFocused ? 'ring-2 ring-blue-100' : ''
            }`}
          />
          <MagnifyingGlassIcon 
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              isFocused ? 'text-blue-500' : 'text-gray-400'
            } transition-colors duration-200`}
          />
        </div>
      </form>
    </div>
  );
}