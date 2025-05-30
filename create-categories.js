// カテゴリテーブル作成スクリプト
const { createClient } = require('@supabase/supabase-js');

// Supabaseの認証情報
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabaseクライアント作成
const supabase = createClient(supabaseUrl, supabaseKey);

async function createCategoriesTable() {
  console.log('カテゴリテーブル作成を開始します...');
  
  try {
    // テーブル作成のSQLクエリ
    const { data, error } = await supabase.rpc('create_categories_table');
    
    if (error) {
      throw error;
    }
    
    console.log('カテゴリテーブルが正常に作成されました:', data);
    
    // 初期カテゴリの登録
    await insertInitialCategories();
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

async function insertInitialCategories() {
  console.log('初期カテゴリを登録します...');
  
  const initialCategories = [
    { name: '工具', description: '各種工具類', display_order: 10 },
    { name: '材料', description: '原材料・部品', display_order: 20 },
    { name: '消耗品', description: '定期的に交換が必要な消耗品', display_order: 30 },
    { name: '設備', description: '工場設備・装置', display_order: 40 }
  ];
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(initialCategories);
    
    if (error) {
      throw error;
    }
    
    console.log('初期カテゴリの登録が完了しました');
    
  } catch (error) {
    console.error('カテゴリ登録中にエラーが発生しました:', error);
  }
}

// カテゴリテーブル作成関数を実行
createCategoriesTable();
