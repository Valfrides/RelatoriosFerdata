import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/src/db/index';
import * as schema from '@/src/db/schema';
import { getSupabase } from '@/lib/supabase';
import { isSqlConfigured } from '@/lib/db';

interface AuthUser {
  id: string;
  username: string;
  nome: string;
  senhaHash: string;
  perfil: 'admin' | 'tecnico' | 'operador';
  email?: string;
  created_at?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');

const DEFAULT_USERS: AuthUser[] = [
  {
    id: '1',
    username: 'admin',
    nome: 'Administrador Ferdata',
    senhaHash: '*Metalica8910',
    perfil: 'admin',
    email: 'admin@ferdata.com.br',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'ferdata',
    nome: 'Operador Ferdata',
    senhaHash: '*Fer6691',
    perfil: 'tecnico',
    email: 'suporte@ferdata.com.br',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    username: 'valfrides',
    nome: 'Valfrides',
    senhaHash: 'valfrides',
    perfil: 'admin',
    email: 'valfrides@gmail.com',
    created_at: new Date().toISOString(),
  },
];

function getLocalAuthData(): AuthUser[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(AUTH_FILE)) {
      fs.writeFileSync(AUTH_FILE, JSON.stringify(DEFAULT_USERS, null, 2), 'utf-8');
      return DEFAULT_USERS;
    }
    const content = fs.readFileSync(AUTH_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_USERS;
  } catch (err) {
    console.error('Erro ao ler auth.json:', err);
    return DEFAULT_USERS;
  }
}

function saveLocalAuthData(users: AuthUser[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(AUTH_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar auth.json:', err);
  }
}

// Busca todos os usuários sincronizados (Supabase -> Cloud SQL -> Local)
async function fetchAllUsers(): Promise<AuthUser[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      // 1. Tenta carregar de app_settings (onde está salvo com 100% de integridade com as senhas alteradas)
      const { data: settingData, error: settingError } = await sb
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'auth_users')
        .maybeSingle();

      if (!settingError && settingData?.setting_value) {
        try {
          const parsed = JSON.parse(settingData.setting_value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.warn('Erro ao parsear auth_users de app_settings:', e);
        }
      }

      // 2. Tenta carregar da tabela users se as colunas estiverem migradas
      const { data, error } = await sb
        .from('users')
        .select('*')
        .order('id', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((u: any) => ({
          id: String(u.id || u.uid),
          username: u.username || u.uid,
          nome: u.name || u.username || u.uid,
          senhaHash: u.password_hash || '',
          perfil: (u.role as any) || 'operador',
          email: u.email || '',
          created_at: u.created_at,
        }));
        if (mapped.some((m) => !!m.senhaHash)) {
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Erro ao ler usuários no Supabase:', err);
    }
  }

  // 3. Cloud SQL
  if (isSqlConfigured()) {
    try {
      const rows = await db.select().from(schema.users).orderBy(asc(schema.users.id));
      if (rows && rows.length > 0) {
        return rows.map((u) => ({
          id: String(u.id),
          username: u.username || u.uid,
          nome: u.name || u.username || u.uid,
          senhaHash: u.password_hash || '',
          perfil: (u.role as any) || 'operador',
          email: u.email || '',
          created_at: u.createdAt ? u.createdAt.toISOString() : undefined,
        }));
      }
    } catch (err) {
      console.warn('Erro ao ler usuários no SQL:', err);
    }
  }

  // 4. Contingência local
  return getLocalAuthData();
}

// Sincroniza persistência de um usuário para Supabase, Cloud SQL e Local
async function syncSaveUser(user: AuthUser, isNew: boolean = false) {
  // Atualiza a lista completa local
  const localUsers = getLocalAuthData();
  const idx = localUsers.findIndex((u) => u.username.toLowerCase() === user.username.toLowerCase());
  if (idx !== -1) {
    localUsers[idx] = { ...localUsers[idx], ...user };
  } else {
    localUsers.push(user);
  }
  saveLocalAuthData(localUsers);

  // 1. Supabase - Salva em app_settings garantindo persistência imediata das credenciais
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('app_settings').upsert(
        {
          setting_key: 'auth_users',
          setting_value: JSON.stringify(localUsers),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'setting_key' }
      );
    } catch (err) {
      console.warn('Erro ao sincronizar auth_users no Supabase app_settings:', err);
    }

    // Tenta atualizar também a tabela users (com fallback caso colunas específicas não existam)
    try {
      const fullRecord = {
        uid: user.username,
        username: user.username,
        password_hash: user.senhaHash,
        name: user.nome,
        role: user.perfil,
        email: user.email || `${user.username}@ferdata.com.br`,
      };

      const { error: fullError } = await sb.from('users').upsert(fullRecord, { onConflict: 'uid' });

      if (fullError) {
        // Fallback seguro usando apenas as colunas nativas existentes na tabela users
        await sb.from('users').upsert(
          {
            uid: user.username,
            name: user.nome,
            role: user.perfil,
            email: user.email || `${user.username}@ferdata.com.br`,
          },
          { onConflict: 'uid' }
        );
      }
    } catch (err) {
      console.warn('Erro ao sincronizar tabela users no Supabase:', err);
    }
  }

  // 2. Cloud SQL
  if (isSqlConfigured()) {
    try {
      if (isNew) {
        await db
          .insert(schema.users)
          .values({
            uid: user.username,
            username: user.username,
            password_hash: user.senhaHash,
            name: user.nome,
            role: user.perfil,
            email: user.email || `${user.username}@ferdata.com.br`,
          })
          .onConflictDoUpdate({
            target: schema.users.uid,
            set: {
              password_hash: user.senhaHash,
              name: user.nome,
              role: user.perfil,
            },
          });
      } else {
        await db
          .update(schema.users)
          .set({
            password_hash: user.senhaHash,
            name: user.nome,
            role: user.perfil,
          })
          .where(eq(schema.users.username, user.username));
      }
    } catch (err) {
      console.warn('Erro ao sincronizar usuário com SQL:', err);
    }
  }
}

// Sincroniza exclusão de usuário
async function syncDeleteUser(username: string) {
  const localUsers = getLocalAuthData();
  const filtered = localUsers.filter((u) => u.username.toLowerCase() !== username.toLowerCase());
  saveLocalAuthData(filtered);

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('app_settings').upsert(
        {
          setting_key: 'auth_users',
          setting_value: JSON.stringify(filtered),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'setting_key' }
      );
    } catch (err) {
      console.warn('Erro ao atualizar app_settings após exclusão no Supabase:', err);
    }

    try {
      await sb.from('users').delete().eq('uid', username);
    } catch (err) {
      // Ignora
    }
  }

  if (isSqlConfigured()) {
    try {
      await db.delete(schema.users).where(eq(schema.users.username, username));
    } catch (err) {
      console.warn('Erro ao deletar usuário no SQL:', err);
    }
  }
}

export async function GET() {
  try {
    const users = await fetchAllUsers();
    // Retorna lista segura sem hashes de senha
    const safeUsers = users.map((u) => ({
      id: u.id,
      username: u.username,
      nome: u.nome,
      perfil: u.perfil,
      email: u.email,
      created_at: u.created_at,
    }));
    return NextResponse.json({ success: true, users: safeUsers });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao listar usuários' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, password, currentPassword, newPassword, nome, perfil, email } = body;
    const users = await fetchAllUsers();

    // ==========================================
    // 1. LOGIN
    // ==========================================
    if (action === 'login') {
      const cleanUser = String(username || '').trim().toLowerCase();
      const cleanPass = String(password || '').trim();

      if (!cleanUser || !cleanPass) {
        return NextResponse.json(
          { success: false, message: 'Usuário e senha são obrigatórios.' },
          { status: 400 }
        );
      }

      const user = users.find((u) => u.username.toLowerCase() === cleanUser);

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Usuário ou senha incorretos.' },
          { status: 401 }
        );
      }

      // CORREÇÃO CRÍTICA: Compara EXATAMENTE com a senha cadastrada/alterada
      // NUNCA mais permite senhas antigas 'admin' após alteração
      const passwordMatches = user.senhaHash === cleanPass;

      if (!passwordMatches) {
        return NextResponse.json(
          { success: false, message: 'Senha incorreta. Verifique os dados digitados.' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          nome: user.nome,
          perfil: user.perfil,
          email: user.email,
        },
      });
    }

    // ==========================================
    // 2. ALTERAR PRÓPRIA SENHA
    // ==========================================
    if (action === 'change-password') {
      const cleanUser = String(username || '').trim().toLowerCase();
      const cleanCurrent = String(currentPassword || '').trim();
      const cleanNew = String(newPassword || '').trim();

      if (!cleanUser || !cleanCurrent || !cleanNew) {
        return NextResponse.json(
          { success: false, message: 'Todos os campos de senha são obrigatórios.' },
          { status: 400 }
        );
      }

      if (cleanNew.length < 3) {
        return NextResponse.json(
          { success: false, message: 'A nova senha deve ter no mínimo 3 caracteres.' },
          { status: 400 }
        );
      }

      const userIndex = users.findIndex((u) => u.username.toLowerCase() === cleanUser);
      if (userIndex === -1) {
        return NextResponse.json(
          { success: false, message: 'Usuário não encontrado.' },
          { status: 404 }
        );
      }

      const user = users[userIndex];
      // Valida estritamente a senha atual
      if (user.senhaHash !== cleanCurrent) {
        return NextResponse.json(
          { success: false, message: 'A senha atual informada está incorreta.' },
          { status: 401 }
        );
      }

      // Atualiza senha e sincroniza com Supabase / Cloud SQL / Local
      user.senhaHash = cleanNew;
      await syncSaveUser(user, false);

      return NextResponse.json({
        success: true,
        message: 'Senha alterada com sucesso! Apenas a nova senha será aceita nos próximos logins.',
      });
    }

    // ==========================================
    // 3. CADASTRAR NOVO USUÁRIO
    // ==========================================
    if (action === 'create-user') {
      const cleanUser = String(username || '').trim().toLowerCase();
      const cleanNome = String(nome || '').trim();
      const cleanPass = String(password || '').trim();
      const cleanPerfil = (perfil || 'operador') as 'admin' | 'tecnico' | 'operador';
      const cleanEmail = String(email || '').trim();

      if (!cleanUser || !cleanNome || !cleanPass) {
        return NextResponse.json(
          { success: false, message: 'Login, Nome Completo e Senha são obrigatórios.' },
          { status: 400 }
        );
      }

      if (cleanUser.length < 3) {
        return NextResponse.json(
          { success: false, message: 'O nome de usuário deve ter no mínimo 3 caracteres.' },
          { status: 400 }
        );
      }

      if (cleanPass.length < 3) {
        return NextResponse.json(
          { success: false, message: 'A senha deve ter no mínimo 3 caracteres.' },
          { status: 400 }
        );
      }

      const exists = users.some((u) => u.username.toLowerCase() === cleanUser);
      if (exists) {
        return NextResponse.json(
          { success: false, message: `O usuário "${cleanUser}" já está cadastrado no sistema.` },
          { status: 400 }
        );
      }

      const newUser: AuthUser = {
        id: String(Date.now()),
        username: cleanUser,
        nome: cleanNome,
        senhaHash: cleanPass,
        perfil: cleanPerfil,
        email: cleanEmail || `${cleanUser}@ferdata.com.br`,
        created_at: new Date().toISOString(),
      };

      await syncSaveUser(newUser, true);

      return NextResponse.json({
        success: true,
        message: `Usuário "${newUser.username}" cadastrado com sucesso e sincronizado com o Supabase!`,
        user: {
          id: newUser.id,
          username: newUser.username,
          nome: newUser.nome,
          perfil: newUser.perfil,
          email: newUser.email,
        },
      });
    }

    // ==========================================
    // 4. EXCLUIR USUÁRIO
    // ==========================================
    if (action === 'delete-user') {
      const cleanUser = String(username || '').trim().toLowerCase();

      if (cleanUser === 'admin') {
        return NextResponse.json(
          { success: false, message: 'O usuário administrador principal não pode ser excluído.' },
          { status: 400 }
        );
      }

      await syncDeleteUser(cleanUser);

      return NextResponse.json({
        success: true,
        message: `Usuário "${cleanUser}" excluído com sucesso do sistema e do Supabase.`,
      });
    }

    // ==========================================
    // 5. REDEFINIR SENHA POR ADMINISTRADOR
    // ==========================================
    if (action === 'admin-reset-password') {
      const cleanUser = String(username || '').trim().toLowerCase();
      const cleanNew = String(newPassword || '').trim();

      if (!cleanUser || !cleanNew || cleanNew.length < 3) {
        return NextResponse.json(
          { success: false, message: 'Informe a nova senha (mínimo 3 caracteres).' },
          { status: 400 }
        );
      }

      const user = users.find((u) => u.username.toLowerCase() === cleanUser);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Usuário não encontrado.' },
          { status: 404 }
        );
      }

      user.senhaHash = cleanNew;
      await syncSaveUser(user, false);

      return NextResponse.json({
        success: true,
        message: `Senha do usuário "${cleanUser}" atualizada com sucesso no Supabase!`,
      });
    }

    return NextResponse.json({ success: false, message: 'Ação inválida.' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Erro no endpoint de autenticação:', err);
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor ao processar autenticação.' },
      { status: 500 }
    );
  }
}
