import { NextResponse } from 'next/server';
import { getLatestArticles } from '@/lib/articles';

export async function GET() {
  try {
    const articles = await getLatestArticles(100);
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json(
      { error: '記事の取得に失敗しました' },
      { status: 500 }
    );
  }
} 