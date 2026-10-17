import { NextRequest, NextResponse } from 'next/server';
import { getUnidades, createUnidade, updateUnidade, deleteUnidade } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const clienteIdParam = searchParams.get('id_cliente');
    const clienteId = clienteIdParam ? parseInt(clienteIdParam, 10) : undefined;
    const unidades = await getUnidades(clienteId);
    return NextResponse.json({ success: true, data: unidades });
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar unidades' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id_cliente || !body.nome_unidade) {
      return NextResponse.json(
        { success: false, error: 'id_cliente e nome_unidade são obrigatórios' },
        { status: 400 }
      );
    }
    const nova = await createUnidade({
      id_cliente: Number(body.id_cliente),
      nome_unidade: body.nome_unidade,
    });
    return NextResponse.json({ success: true, data: nova }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar unidade:', error);
    return NextResponse.json({ success: false, error: 'Falha ao cadastrar unidade' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id_unidade) {
      return NextResponse.json({ success: false, error: 'id_unidade é obrigatório' }, { status: 400 });
    }
    const atualizado = await updateUnidade(Number(body.id_unidade), {
      nome_unidade: body.nome_unidade,
      id_cliente: body.id_cliente !== undefined ? Number(body.id_cliente) : undefined,
    });
    if (!atualizado) {
      return NextResponse.json({ success: false, error: 'Unidade não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: atualizado });
  } catch (error) {
    console.error('Erro ao atualizar unidade:', error);
    return NextResponse.json({ success: false, error: 'Falha ao atualizar unidade' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const idParam = searchParams.get('id_unidade');
    if (!idParam) {
      return NextResponse.json({ success: false, error: 'id_unidade é obrigatório' }, { status: 400 });
    }
    const sucesso = await deleteUnidade(Number(idParam));
    if (!sucesso) {
      return NextResponse.json({ success: false, error: 'Unidade não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Unidade excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir unidade:', error);
    return NextResponse.json({ success: false, error: 'Falha ao excluir unidade' }, { status: 500 });
  }
}
