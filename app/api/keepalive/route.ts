import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. DESATIVA O CACHE DA VERCEL / NEXT.JS (Obrigatório para Crons)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { status: 'error', message: 'Variáveis de ambiente ausentes' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 2. OPERAÇÃO DE ESCRITA REAL (UPSERT):
  // Atualiza sempre o registro de ID 1 com a data/hora atual, forçando escrita de disco no Postgres
  const { data, error } = await supabase
    .from('keep_alive')
    .upsert(
      { id: 1, created_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    .select();

  if (error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: 'ok',
    action: 'ping_written',
    updated_at: new Date().toISOString(),
    data,
  });
}
