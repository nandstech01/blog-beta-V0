import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { updateArticle } from '@/lib/articles';

const ARTICLES_DIR = path.join(process.cwd(), 'data', 'articles');

export async function GET(request: Request) {
  try {
    const id = request.url.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'IDが提供されていません' },
        { status: 400 }
      );
    }

    await fs.mkdir(ARTICLES_DIR, { recursive: true });
    const filePath = path.join(ARTICLES_DIR, `${id}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    const article = JSON.parse(content);

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Article not found' },
      { status: 404 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const id = request.url.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'IDが提供されていません' },
        { status: 400 }
      );
    }

    const article = await request.json();
    const updatedArticle = await updateArticle(id, article);
    return NextResponse.json(updatedArticle);
  } catch (error) {
    return NextResponse.json(
      { error: '記事の更新に失敗しました' },
      { status: 500 }
    );
  }
}
