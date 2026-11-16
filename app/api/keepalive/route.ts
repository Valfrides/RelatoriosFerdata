import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const now = new Date().toISOString();

  // 1. Atualiza o registro fixo
  await supabase
    .from('keep_alive')
    .upsert([{ id: 1, created_at: now }], { onConflict: 'id' });

  // 2. Insere e deleta um registro efêmero (gera atividade real de I/O e WAL no Postgres)
  const randomId = Math.floor(Math.random() * 100000) + 10;
  await supabase.from('keep_alive').insert([{ id: randomId, created_at: now }]);
  await supabase.from('keep_alive').delete().eq('id', randomId);

  // 3. Executa leituras reais nas tabelas da aplicação e no serviço de Auth
  const { count } = await supabase
    .from('keep_alive')
    .select('*', { count: 'exact', head: true });
  await supabase.auth.getSession();

  return new NextResponse(
    JSON.stringify({
      status: 'ok',
      action: 'multi_activity_logged',
      timestamp: now,
      rows: count,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
