import { getArticleById } from '@/lib/articles';
import EditArticleForm from './EditArticleForm';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    return <div>記事が見つかりません</div>;
  }

  return <EditArticleForm article={article} />;
}
