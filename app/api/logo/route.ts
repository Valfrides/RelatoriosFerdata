import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const LOGO_FILE = path.join(DATA_DIR, 'logo.json');

let cachedLogo: string | null = null;
let cacheLoaded = false;

function carregarLogoDoDisco(): string | null {
  try {
    if (fs.existsSync(LOGO_FILE)) {
      const content = fs.readFileSync(LOGO_FILE, 'utf-8');
      const data = JSON.parse(content);
      return data.logo || null;
    }
  } catch (err) {
    console.error('Erro ao ler logo.json:', err);
  }
  return null;
}

export async function GET() {
  try {
    if (!cacheLoaded) {
      cachedLogo = carregarLogoDoDisco();
      cacheLoaded = true;
    }
    return NextResponse.json({ success: true, logo: cachedLogo });
  } catch (error) {
    console.error('Erro ao buscar logotipo:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar logotipo' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.logo || typeof body.logo !== 'string') {
      return NextResponse.json({ success: false, error: 'Nenhuma imagem válida enviada' }, { status: 400 });
    }
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const payload = {
      logo: body.logo,
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(LOGO_FILE, JSON.stringify(payload), 'utf-8');
    cachedLogo = body.logo;
    cacheLoaded = true;
    return NextResponse.json({
      success: true,
      message: 'Logotipo atualizado e incorporado com sucesso!',
      logo: cachedLogo,
    });
  } catch (error) {
    console.error('Erro ao salvar logotipo:', error);
    return NextResponse.json({ success: false, error: 'Falha ao salvar logotipo' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    if (fs.existsSync(LOGO_FILE)) {
      fs.unlinkSync(LOGO_FILE);
    }
    cachedLogo = null;
    cacheLoaded = true;
    return NextResponse.json({
      success: true,
      message: 'Logotipo personalizado removido. Restaurado padrão oficial.',
    });
  } catch (error) {
    console.error('Erro ao redefinir logotipo:', error);
    return NextResponse.json({ success: false, error: 'Falha ao redefinir logotipo' }, { status: 500 });
  }
}
