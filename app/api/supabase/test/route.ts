import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getSupabaseConfig, isSupabaseConfigured } from '@/lib/supabase';
import { isSqlConfigured, getActiveBackendName, DEFAULT_CLIENTES, DEFAULT_UNIDADES, DEFAULT_SERVICOS } from '@/lib/db';

export async function GET() {
  try {
    const { url, isConfigured } = getSupabaseConfig();
    const activeBackend = getActiveBackendName();

    if (!isConfigured) {
      return NextResponse.json({
        success: true,
        configured: false,
        activeBackend,
        message: 'Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não estão configuradas ou contêm valores de exemplo.',
        details: {
          hasUrl: !!url && !url.includes('your-project'),
          cloudSqlConfigured: isSqlConfigured(),
        },
      });
    }

    const sb = getSupabase();
    if (!sb) {
      return NextResponse.json({
        success: false,
        configured: true,
        connected: false,
        activeBackend,
        error: 'Não foi possível inicializar o cliente Supabase.',
      });
    }

    const startTime = Date.now();
    // Teste de consulta em cada tabela
    const [clientesRes, unidadesRes, servicosRes] = await Promise.all([
      sb.from('clientes').select('id_cliente', { count: 'exact', head: true }),
      sb.from('unidades').select('id_unidade', { count: 'exact', head: true }),
      sb.from('servicos_realizados').select('id_servico', { count: 'exact', head: true }),
    ]);

    const latencyMs = Date.now() - startTime;

    const tables = {
      clientes: {
        exists: !clientesRes.error,
        count: clientesRes.count ?? 0,
        error: clientesRes.error ? clientesRes.error.message : null,
      },
      unidades: {
        exists: !unidadesRes.error,
        count: unidadesRes.count ?? 0,
        error: unidadesRes.error ? unidadesRes.error.message : null,
      },
      servicos_realizados: {
        exists: !servicosRes.error,
        count: servicosRes.count ?? 0,
        error: servicosRes.error ? servicosRes.error.message : null,
      },
    };

    const allTablesExist = tables.clientes.exists && tables.unidades.exists && tables.servicos_realizados.exists;
    const isConnected = !clientesRes.error || !unidadesRes.error || !servicosRes.error;

    return NextResponse.json({
      success: true,
      configured: true,
      connected: isConnected,
      latencyMs,
      activeBackend,
      url: url.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co'),
      allTablesExist,
      tables,
    });
  } catch (error: any) {
    console.error('Erro ao testar conexão Supabase:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Falha ao conectar ao Supabase',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sb = getSupabase();
    if (!sb || !isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Supabase não está configurado no momento.' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'seed';

    if (action === 'seed') {
      // 1. Inserir Clientes
      const { error: errCli } = await sb.from('clientes').upsert(
        DEFAULT_CLIENTES.map((c) => ({
          id_cliente: c.id_cliente,
          nome_empresa: c.nome_empresa,
          contato_ac: c.contato_ac,
        }))
      );

      // 2. Inserir Unidades
      const { error: errUni } = await sb.from('unidades').upsert(
        DEFAULT_UNIDADES.map((u) => ({
          id_unidade: u.id_unidade,
          id_cliente: u.id_cliente,
          nome_unidade: u.nome_unidade,
        }))
      );

      // 3. Inserir Serviços
      const { error: errServ } = await sb.from('servicos_realizados').upsert(
        DEFAULT_SERVICOS.map((s) => ({
          id_servico: s.id_servico,
          id_cliente: s.id_cliente,
          id_unidade: s.id_unidade,
          data_visita: s.data_visita,
          periodo: s.periodo,
          qtde_horas: s.qtde_horas,
          descricao_servicos: s.descricao_servicos,
        }))
      );

      if (errCli || errUni || errServ) {
        return NextResponse.json({
          success: false,
          error: 'Erro ao popular dados no Supabase. Verifique se executou a migração SQL no Supabase.',
          details: { errCli, errUni, errServ },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Dados iniciais populados com sucesso no Supabase!',
      });
    }

    return NextResponse.json({ success: false, error: 'Ação desconhecida.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro na ação do Supabase:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar solicitação.' },
      { status: 500 }
    );
  }
}
