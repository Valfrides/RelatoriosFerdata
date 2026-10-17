import { NextRequest, NextResponse } from 'next/server';
import { getServicos, createServico } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id_cliente = searchParams.get('id_cliente') ? parseInt(searchParams.get('id_cliente')!, 10) : undefined;
    const id_unidade = searchParams.get('id_unidade') ? parseInt(searchParams.get('id_unidade')!, 10) : undefined;
    const data_inicio = searchParams.get('data_inicio') || undefined;
    const data_fim = searchParams.get('data_fim') || undefined;

    const servicos = await getServicos({
      id_cliente,
      id_unidade,
      data_inicio,
      data_fim,
    });

    return NextResponse.json({ success: true, data: servicos });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar serviços' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id_cliente) {
      return NextResponse.json({ success: false, error: 'O cliente é obrigatório' }, { status: 400 });
    }
    if (!body.data_visita) {
      return NextResponse.json({ success: false, error: 'A data da visita é obrigatória' }, { status: 400 });
    }
    if (!body.periodo) {
      return NextResponse.json({ success: false, error: 'O período é obrigatório' }, { status: 400 });
    }
    if (!body.descricao_servicos) {
      return NextResponse.json({ success: false, error: 'A descrição dos serviços é obrigatória' }, { status: 400 });
    }

    const novoServico = await createServico({
      id_cliente: Number(body.id_cliente),
      id_unidade: body.id_unidade ? Number(body.id_unidade) : null,
      data_visita: body.data_visita,
      periodo: body.periodo,
      qtde_horas: body.qtde_horas !== undefined ? Number(body.qtde_horas) : 0,
      descricao_servicos: body.descricao_servicos,
    });

    return NextResponse.json({ success: true, data: novoServico }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar serviço:', error);
    return NextResponse.json({ success: false, error: 'Falha ao salvar serviço' }, { status: 500 });
  }
}
