const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const supabase = createClient(process.env.VITE_SUPABASE_URL || 'http://localhost', process.env.VITE_SUPABASE_ANON_KEY || 'abc');

async function check() {
  const { data, error } = await supabase.from('foods').select('*').limit(1);
  if (error) console.error(error);
  console.log(data);
}
check();
