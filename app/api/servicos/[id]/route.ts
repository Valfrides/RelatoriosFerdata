import { NextRequest, NextResponse } from 'next/server';
import { getServicoById, updateServico, deleteServico } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const servicoId = parseInt(id, 10);
    const servico = await getServicoById(servicoId);
    if (!servico) {
      return NextResponse.json({ success: false, error: 'Serviço não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: servico });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const servicoId = parseInt(id, 10);
    const body = await req.json();
    const atualizado = await updateServico(servicoId, body);
    if (!atualizado) {
      return NextResponse.json({ success: false, error: 'Serviço não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: atualizado });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar serviço' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const servicoId = parseInt(id, 10);
    const sucesso = await deleteServico(servicoId);
    if (!sucesso) {
      return NextResponse.json({ success: false, error: 'Serviço não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Serviço excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    return NextResponse.json({ success: false, error: 'Erro ao excluir serviço' }, { status: 500 });
  }
}
