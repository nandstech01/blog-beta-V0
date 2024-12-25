import { supabase } from '../db';

async function testDatabaseConnection() {
  try {
    console.log('Testing Supabase connection...');

    // 基本的なCRUD操作のテスト
    console.log('\n=== Basic CRUD Operations Test ===');
    await testBasicCRUD();

    console.log('\n✅ All database operations completed successfully');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

async function testBasicCRUD() {
  // テスト用の記事データを作成
  const testArticle = {
    id: 'test-' + Date.now(),
    title: 'Test Article',
    content: 'This is a test article',
    category: 'test',
    keywords: 'test,connection',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 記事を作成
  console.log('Creating test article...');
  const { error: insertError } = await supabase
    .from('articles')
    .insert(testArticle);

  if (insertError) {
    throw insertError;
  }
  console.log('✅ Article created successfully');

  // 記事を取得
  console.log('Fetching test article...');
  const { data: fetchedArticle, error: fetchError } = await supabase
    .from('articles')
    .select('*')
    .eq('id', testArticle.id)
    .single();

  if (fetchError) {
    throw fetchError;
  }
  console.log('✅ Article fetched successfully:', fetchedArticle);

  // 記事を削除
  console.log('Deleting test article...');
  const { error: deleteError } = await supabase
    .from('articles')
    .delete()
    .eq('id', testArticle.id);

  if (deleteError) {
    throw deleteError;
  }
  console.log('✅ Article deleted successfully');
}

// スクリプトとして実行された場合のみテストを実行
if (require.main === module) {
  testDatabaseConnection().catch((error: unknown) => {
    console.error('Unhandled error during database test:', 
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  });
}

export { testDatabaseConnection }; 