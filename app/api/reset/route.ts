import { NextResponse } from 'next/server';
import { resetDatabase } from '@/lib/db';

export async function POST() {
  try {
    const data = await resetDatabase();
    return NextResponse.json({
      success: true,
      message: 'Banco de dados restaurado com sucesso para os dados padrão!',
      counts: {
        clientes: data.clientes.length,
        unidades: data.unidades.length,
        servicos: data.servicos.length,
      },
    });
  } catch (error) {
    console.error('Erro ao restaurar banco de dados:', error);
    return NextResponse.json({ success: false, error: 'Falha ao restaurar banco de dados' }, { status: 500 });
  }
}
