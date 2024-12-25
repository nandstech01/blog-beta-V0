import { notFound } from 'next/navigation';
import { getArticleById, getArticlesByCategory } from '@/lib/articles';
import { marked } from 'marked';
import ShareButtons from '@/components/ShareButtons';
import RelatedArticles from '@/components/RelatedArticles';
import { findCategory } from '@/lib/categories';
import SearchBox from '@/components/SearchBox';
import CategoryList from '@/components/CategoryList';
import PopularArticles from '@/components/PopularArticles';
import Link from 'next/link';
import Image from 'next/image';

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  // markedの設定
  marked.setOptions({
    gfm: true,
    breaks: true
  });

  // HTMLに変換
  const content = await marked(article.content);

  // カテゴリー情報を取得
  const category = findCategory(article.category);

  // 関連記事を取得
  const relatedArticles = await getArticlesByCategory(article.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* サイドバー - 左側 */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <div className="sticky top-8 space-y-8">
            <SearchBox />
            <CategoryList />
          </div>
        </div>

        {/* メインコンテンツ - 中央 */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <article className="prose prose-lg max-w-none">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <time className="text-gray-600">
                  {new Date(article.createdAt).toLocaleDateString('ja-JP')}
                </time>
                <Link
                  href={`/category/${article.category}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  {article.category}
                </Link>
              </div>
              {article.description && (
                <p className="text-xl text-gray-600 mb-6">{article.description}</p>
              )}
              <ShareButtons url={`/articles/${article.id}`} title={article.title} />
            </div>

            <div 
              className="article-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          </article>

          {/* 関連記事 */}
          <div className="mt-16 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">関連記事</h2>
            <RelatedArticles 
              currentArticleId={article.id} 
              categoryId={article.category}
              articles={relatedArticles}
            />
          </div>
        </div>

        {/* サイドバー - 右側 */}
        <div className="lg:col-span-3 order-3">
          <div className="sticky top-8">
            <PopularArticles />
          </div>
        </div>
      </div>
    </div>
  );
}