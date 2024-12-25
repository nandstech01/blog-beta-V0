import { getLatestArticles } from '@/lib/articles';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Categories from '@/components/Categories';
import LatestArticles from '@/components/LatestArticles';
import EditorInfo from '@/components/EditorInfo';
import { Article } from '@/types/article';

export default async function HomePage() {
  const latestArticles: Article[] = await getLatestArticles(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Stats />
        
        <Categories />
        <LatestArticles articles={latestArticles} />
       
        <EditorInfo />
      </div>
    </div>
  );
}