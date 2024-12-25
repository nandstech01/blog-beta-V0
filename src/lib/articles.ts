import { Article } from '@/types';
import { supabase } from '@/db';

// 最新の記事を取得
export async function getLatestArticles(limit: number = 3): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }

  return data || [];
}

// IDで記事を取得
export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article by ID:', error);
    return null;
  }

  return data;
}

// カテゴリーで記事を取得
export async function getArticlesByCategory(category: string): Promise<Article[]> {
  try {
    const decodedCategory = decodeURIComponent(category);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', decodedCategory)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles by category:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return [];
  }
}

// 記事を更新
export async function updateArticle(id: string, data: Partial<Article>): Promise<Article | null> {
  const { data: updatedData, error } = await supabase
    .from('articles')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating article:', error);
    return null;
  }

  return updatedData;
}

// 記事を検索
export async function getArticlesBySearch(query: string, category: string, page: number = 1) {
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  let queryBuilder = supabase
    .from('articles')
    .select('*', { count: 'exact' });

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`
    );
  }

  if (category && category !== 'すべて') {
    queryBuilder = queryBuilder.eq('category', category);
  }

  const { data, count, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .range(skip, skip + pageSize - 1);

  if (error) {
    console.error('Error searching articles:', error);
    return {
      articles: [],
      totalPages: 0,
    };
  }

  return {
    articles: data || [],
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}