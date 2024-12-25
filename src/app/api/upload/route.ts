import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// 画像の制約を定義
const IMAGE_CONSTRAINTS = {
  width: 1200,
  height: 630,
  tolerance: 10,
  maxSize: 500 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '画像がアップロードされていません' },
        { status: 400 }
      );
    }

    console.log('File info:', {
      type: file.type,
      size: file.size,
      name: file.name
    });

    if (!IMAGE_CONSTRAINTS.allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `不正なファイル形式です: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > IMAGE_CONSTRAINTS.maxSize) {
      return NextResponse.json(
        { error: `ファイルサイズが大きすぎます: ${(file.size / 1024).toFixed(2)}KB` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    let imageBuffer = Buffer.from(bytes);

    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      
      console.log('Image metadata:', metadata);

      if (!metadata.width || !metadata.height) {
        return NextResponse.json(
          { error: '画像サイズを取得できませんでした' },
          { status: 400 }
        );
      }

      // uploadsディレクトリを作成
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      // 画像を最適化
      const optimizedImage = image
        .resize(IMAGE_CONSTRAINTS.width, IMAGE_CONSTRAINTS.height, {
          fit: 'cover',
          position: 'center'
        });

      // JPEGとして保存
      imageBuffer = await (optimizedImage as any)
        .toFormat('jpeg', { quality: 85, mozjpeg: true })
        .toBuffer();

      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name.replace(/\.[^/.]+$/, '')}.jpg`;
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, imageBuffer);
      
      return NextResponse.json({ 
        url: `/uploads/${filename}`,
        success: true,
        message: '画像をアップロードしました'
      });

    } catch (sharpError) {
      console.error('Sharp error:', sharpError);
      return NextResponse.json(
        { error: '画像の処理中にエラーが発生しました' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `アップロードに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
      { status: 500 }
    );
  }
} 