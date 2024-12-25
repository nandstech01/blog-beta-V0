import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticle } from '@/lib/articles';
import { supabase } from '@/db';

// GET ハンドラー
export async function GET(request: NextRequest) {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
  }

  const article = await getArticleById(id);
  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  return NextResponse.json(article);
}

// PUT ハンドラー
export async function PUT(request: NextRequest) {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updatedArticle = await updateArticle(id, body);
    
    if (!updatedArticle) {
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE ハンドラー
export async function DELETE(request: NextRequest) {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Article deleted successfully' });
}
