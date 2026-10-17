import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabase } from '@/lib/supabase';

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
    // Silencia erro em ambientes serverless read-only
  }
  return null;
}

function salvarLogoNoDisco(logo: string): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const payload = {
      logo,
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(LOGO_FILE, JSON.stringify(payload), 'utf-8');
  } catch (err) {
    // Em ambientes serverless como Vercel o sistema de arquivos é somente leitura (EROFS)
    // Isso é esperado e normal, a persistência principal é o Supabase
  }
}

function removerLogoDoDisco(): void {
  try {
    if (fs.existsSync(LOGO_FILE)) {
      fs.unlinkSync(LOGO_FILE);
    }
  } catch (err) {
    // Silencia erro em serverless
  }
}

export async function GET() {
  try {
    // 1. Tenta carregar do Supabase (persistente na nuvem e no Vercel)
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('app_settings')
          .select('setting_value')
          .eq('setting_key', 'app_logo')
          .maybeSingle();

        if (!error && data?.setting_value) {
          cachedLogo = data.setting_value;
          cacheLoaded = true;
          return NextResponse.json({ success: true, logo: cachedLogo });
        }
      } catch (sbErr) {
        console.warn('Aviso: falha ao ler app_logo do Supabase:', sbErr);
      }
    }

    // 2. Se não estiver no Supabase, tenta carregar do disco local
    if (!cacheLoaded) {
      cachedLogo = carregarLogoDoDisco();
      cacheLoaded = true;
    }

    return NextResponse.json({ success: true, logo: cachedLogo });
  } catch (error) {
    console.error('Erro ao buscar logotipo:', error);
    return NextResponse.json({ success: true, logo: cachedLogo || null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.logo || typeof body.logo !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Nenhuma imagem válida enviada' },
        { status: 400 }
      );
    }

    const novoLogo = body.logo;

    // 1. Persiste no Supabase app_settings (compatível 100% com Vercel)
    const sb = getSupabase();
    if (sb) {
      try {
        const { error: sbError } = await sb.from('app_settings').upsert(
          {
            setting_key: 'app_logo',
            setting_value: novoLogo,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'setting_key' }
        );

        if (sbError) {
          console.warn('Aviso ao salvar logo no Supabase:', sbError);
        }
      } catch (sbErr) {
        console.warn('Erro ao conectar ao Supabase para salvar logo:', sbErr);
      }
    }

    // 2. Tenta salvar em disco local para cache local (não falha se read-only)
    salvarLogoNoDisco(novoLogo);

    cachedLogo = novoLogo;
    cacheLoaded = true;

    return NextResponse.json({
      success: true,
      message: 'Logotipo atualizado e sincronizado com sucesso!',
      logo: cachedLogo,
    });
  } catch (error: any) {
    console.error('Erro ao salvar logotipo:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha ao salvar logotipo' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // 1. Remove do Supabase app_settings
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('app_settings').delete().eq('setting_key', 'app_logo');
      } catch (sbErr) {
        console.warn('Erro ao deletar app_logo no Supabase:', sbErr);
      }
    }

    // 2. Remove do disco local
    removerLogoDoDisco();

    cachedLogo = null;
    cacheLoaded = true;

    return NextResponse.json({
      success: true,
      message: 'Logotipo personalizado removido. Restaurado padrão oficial.',
    });
  } catch (error: any) {
    console.error('Erro ao redefinir logotipo:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha ao redefinir logotipo' },
      { status: 500 }
    );
  }
}
