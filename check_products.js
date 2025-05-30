const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vmewhcmvcbjhxxmzumtm.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZXdoY212Y2JqaHh4bXp1bXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTgxNjEsImV4cCI6MjA2MzY3NDE2MX0.22Uj7Hj3vu9ocqjN8qkVB9FLOafE3Idm6LXHyWcLnvE');
(async () => {
  const { data, error } = await supabase.from('products').select('id, sku, name, is_active, category_id');
  console.log('products', data, error);
})(); 