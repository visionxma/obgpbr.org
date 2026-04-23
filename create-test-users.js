const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

(async () => {
  console.log('Creating Admin...');
  const { data: d1, error: e1 } = await sb.auth.admin.createUser({
    email: 'test_admin_subagent@test.com',
    password: 'Admin@123456',
    email_confirm: true,
    user_metadata: { role: 'admin' },
    app_metadata: { role: 'admin' }
  });
  if(e1) {
    if(e1.message.includes('already exists')) {
      // update password
      const { data: {users} } = await sb.auth.admin.listUsers();
      const adm = users.find(u => u.email === 'test_admin_subagent@test.com');
      if(adm) {
        await sb.auth.admin.updateUserById(adm.id, { password: 'Admin@123456', app_metadata: { role: 'admin' } });
      }
    } else {
      console.error(e1);
    }
  }

  console.log('Creating OSC...');
  const { data: d2, error: e2 } = await sb.auth.admin.createUser({
    email: 'test_osc_subagent@test.com',
    password: 'Osc@123456',
    email_confirm: true,
  });
  if(e2) {
    if(e2.message.includes('already exists')) {
      const { data: {users} } = await sb.auth.admin.listUsers();
      const osc = users.find(u => u.email === 'test_osc_subagent@test.com');
      if(osc) {
        await sb.auth.admin.updateUserById(osc.id, { password: 'Osc@123456' });
      }
    } else {
      console.error(e2);
    }
  }

  console.log('Done!');
})();
