const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testJoin() {
  const { data, error } = await supabase
    .from('osc_perfis')
    .select(`
      id,
      relatorios_conformidade (id)
    `)
    .limit(1);
    
  if (error) {
    console.error("JOIN ERROR:", error.message);
  } else {
    console.log("JOIN SUCCESS:", data);
  }
}

testJoin();
