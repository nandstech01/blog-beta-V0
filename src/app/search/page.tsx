import { Suspense } from 'react';
import SearchForm from '@/components/SearchForm';
import SearchResults from '@/components/SearchResults';
import Loading from '@/components/Loading';

export const metadata = {
  title: '記事検索 | 退職代行比較ナビ',
  description: '退職代行サービスに関する記事を検索できます。',
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || 'すべて';
  const page = Number(params.page) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">記事を検索</h1>
      
      <SearchForm initialQuery={query} initialCategory={category} />
      
      <Suspense fallback={<Loading />}>
        <SearchResults 
          query={query}
          category={category}
          page={page}
        />
      </Suspense>
    </div>
  );
}