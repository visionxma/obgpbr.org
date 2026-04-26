const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  require('dotenv').config({ path: './.env.local' });
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('relatorios_conformidade').select('id, osc_id').limit(1);
  console.log("Select test:", { data, error });

  const dummyId = 'OSC-TEST-' + Date.now();
  const { data: insData, error: insErr } = await supabase.from('relatorios_conformidade').insert({
    osc_id: dummyId,
    status: 'em_preenchimento',
    numero: 'TEST1234'
  }).select();
  console.log("Insert test:", { insData, insErr });
}

test();
