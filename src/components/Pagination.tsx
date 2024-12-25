'use client';

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;
  
  let visiblePages = pages;
  if (totalPages > maxVisiblePages) {
    const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages - 1);
    visiblePages = pages.slice(start - 1, end);
  }

  const getPageUrl = (page: number) => {
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}`;
  };

  return (
    <nav className="flex justify-center space-x-2">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          前へ
        </Link>
      )}
      
      {visiblePages[0] > 1 && (
        <>
          <Link
            href={getPageUrl(1)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            1
          </Link>
          {visiblePages[0] > 2 && (
            <span className="px-3 py-2 text-gray-500">...</span>
          )}
        </>
      )}
      
      {visiblePages.map(page => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`px-3 py-2 rounded-lg border ${
            currentPage === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {page}
        </Link>
      ))}
      
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-3 py-2 text-gray-500">...</span>
          )}
          <Link
            href={getPageUrl(totalPages)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            {totalPages}
          </Link>
        </>
      )}
      
      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          次へ
        </Link>
      )}
    </nav>
  );
}