import { NextRequest, NextResponse } from 'next/server';
import { getClientes, createCliente, updateCliente, deleteCliente } from '@/lib/db';

export async function GET() {
  try {
    const clientes = await getClientes();
    return NextResponse.json({ success: true, data: clientes });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar clientes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nome_empresa || !body.contato_ac) {
      return NextResponse.json(
        { success: false, error: 'Nome da empresa e contato A/C são obrigatórios' },
        { status: 400 }
      );
    }
    const novo = await createCliente({
      nome_empresa: body.nome_empresa,
      contato_ac: body.contato_ac,
    });
    return NextResponse.json({ success: true, data: novo }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ success: false, error: 'Falha ao cadastrar cliente' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id_cliente) {
      return NextResponse.json({ success: false, error: 'id_cliente é obrigatório' }, { status: 400 });
    }
    const atualizado = await updateCliente(Number(body.id_cliente), {
      nome_empresa: body.nome_empresa,
      contato_ac: body.contato_ac,
    });
    if (!atualizado) {
      return NextResponse.json({ success: false, error: 'Cliente não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: atualizado });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json({ success: false, error: 'Falha ao atualizar cliente' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const idParam = searchParams.get('id_cliente');
    if (!idParam) {
      return NextResponse.json({ success: false, error: 'id_cliente é obrigatório' }, { status: 400 });
    }
    const sucesso = await deleteCliente(Number(idParam));
    if (!sucesso) {
      return NextResponse.json({ success: false, error: 'Cliente não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return NextResponse.json({ success: false, error: 'Falha ao excluir cliente' }, { status: 500 });
  }
}
