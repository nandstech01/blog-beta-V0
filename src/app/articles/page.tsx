import { Article } from '@/types/article';

async function getArticles() {
  // ビルド時は空の配列を返す
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
    return [];
  }

  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
      
    const res = await fetch(`${baseUrl}/api/articles`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) throw new Error('記事の取得に失敗しました');
    
    return res.json();
  } catch (error) {
    console.error('記事取得エラー:', error);
    return [];
  }
}

export const revalidate = 3600; // 1時間ごとに再検証

export default async function ArticlesPage() {
  const articles: Article[] = await getArticles();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">記事一覧</h1>
      <div className="grid gap-6">
        {articles.map((article) => (
          <article key={article.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
            <p className="text-gray-600">{article.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}