const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://kyhvqydnvaselautwcrm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aHZxeWRudmFzZWxhdXR3Y3JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ5NjUzNiwiZXhwIjoyMDkyMDcyNTM2fQ._HuMaM8GAtC1KoHs87O_yvL43sysFzY2cwIljypB4os', { auth: { autoRefreshToken: false, persistSession: false } });

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
