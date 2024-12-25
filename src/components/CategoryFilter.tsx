'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories, Category } from './CategoryList';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">カテゴリー</h3>
      <div className="space-y-2">
        {categories.map((category: Category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
              selectedCategory === category.id
                ? 'bg-red-100 text-red-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {category.title}
          </button>
        ))}
      </div>
    </div>
  );
}