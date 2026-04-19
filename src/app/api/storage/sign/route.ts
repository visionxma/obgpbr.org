import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  // Verify path belongs to this user's osc or user is admin
  const role = user.app_metadata?.role as string | undefined;
  if (!role || role === 'user') {
    const oscId = path.split('/')[1]; // osc/{osc_id}/...
    const { data: perfil } = await supabase
      .from('osc_perfis').select('osc_id').eq('user_id', user.id).single();
    if (!perfil || perfil.osc_id !== oscId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
  }

  const { data, error } = await supabase.storage
    .from('osc-docs').createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'Erro ao gerar URL' }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
