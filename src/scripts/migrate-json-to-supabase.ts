import { config } from 'dotenv';
import path from 'path';

// .env.localファイルを読み込む
config({ path: path.resolve(process.cwd(), '.env.local') });

import fs from 'fs/promises';
import { supabase } from '../db';

interface JsonArticle {
  title: string;
  content: string;
  category: string;
  keywords: string[];
}

async function migrateJsonToSupabase() {
  try {
    console.log('Starting JSON to Supabase migration...');

    // JSONファイルのディレクトリパス
    const jsonDir = path.join(process.cwd(), 'data', 'articles');
    
    // ディレクトリ内のJSONファイルを取得
    const files = await fs.readdir(jsonDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    console.log(`Found ${jsonFiles.length} JSON files to migrate`);

    // 各JSONファイルを処理
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(jsonDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const article: JsonArticle = JSON.parse(content);

        // デバッグ情報を出力
        console.log(`Processing ${file}:`);
        console.log('- Title:', article.title);
        console.log('- Category:', article.category);
        console.log('- Keywords:', article.keywords);
        console.log('- Content length:', article.content.length);

        // タイトルから余分な引用符を削除
        const cleanTitle = article.title.replace(/[「」]/g, '');

        // Supabaseに記事を挿入（idフィールドを省略してgen_random_uuid()を使用）
        const { error } = await supabase
          .from('articles')
          .insert({
            title: cleanTitle,
            content: article.content,
            category: article.category,
            keywords: article.keywords,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error(`Failed to migrate ${file}:`, error);
          continue;
        }

        console.log(`✅ Migrated ${file} successfully`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合のみマイグレーションを実行
if (require.main === module) {
  migrateJsonToSupabase().catch(error => {
    console.error('Unhandled error during migration:', error);
    process.exit(1);
  });
}

export { migrateJsonToSupabase }; 