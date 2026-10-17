import fs from 'fs';
import path from 'path';
import { eq, and, gte, lte, asc } from 'drizzle-orm';
import { db } from '../src/db/index.ts';
import * as schema from '../src/db/schema.ts';
import { getSupabase, isSupabaseConfigured } from './supabase';
import { Cliente, Unidade, ServicoRealizado, ServicoRealizadoCompleto, FiltroRelatorio } from '@/types';

interface DatabaseSchema {
  clientes: Cliente[];
  unidades: Unidade[];
  servicos: ServicoRealizado[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export const DEFAULT_CLIENTES: Cliente[] = [
  { id_cliente: 1, nome_empresa: 'Aluminc', contato_ac: 'Sr. André' },
  { id_cliente: 2, nome_empresa: 'Anelkar', contato_ac: 'Sr. Carlos' },
  { id_cliente: 3, nome_empresa: 'Arte&Magia', contato_ac: 'Sra. Vanessa' },
  { id_cliente: 4, nome_empresa: 'Exfak Corporation Inc.', contato_ac: 'Sr. Sergio' },
  { id_cliente: 5, nome_empresa: 'Favorita Transportes Ltda', contato_ac: 'Sr. Umberto' },
  { id_cliente: 6, nome_empresa: 'Glitter', contato_ac: 'Sr. Roberto' },
  { id_cliente: 7, nome_empresa: 'IMAEV', contato_ac: 'Sr. Marcos' },
  { id_cliente: 8, nome_empresa: 'Tecnibra', contato_ac: 'Sr. Paulo' },
  { id_cliente: 9, nome_empresa: 'Teixeira&Reis', contato_ac: 'Sr. Fernando' },
  { id_cliente: 10, nome_empresa: 'Tofik', contato_ac: 'Sr. Tofik' },
];

export const DEFAULT_UNIDADES: Unidade[] = [
  { id_unidade: 1, id_cliente: 5, nome_unidade: 'Belém' },
  { id_unidade: 2, id_cliente: 5, nome_unidade: 'Brasília' },
  { id_unidade: 3, id_cliente: 5, nome_unidade: 'Campo Grande' },
  { id_unidade: 4, id_cliente: 5, nome_unidade: 'Cuiabá' },
  { id_unidade: 5, id_cliente: 5, nome_unidade: 'Espírito Santo' },
  { id_unidade: 6, id_cliente: 5, nome_unidade: 'Goiânia' },
  { id_unidade: 7, id_cliente: 5, nome_unidade: 'Joinville' },
  { id_unidade: 8, id_cliente: 5, nome_unidade: 'Palmas' },
  { id_unidade: 9, id_cliente: 5, nome_unidade: 'São Paulo' },
  { id_unidade: 10, id_cliente: 5, nome_unidade: 'Sumaré' },
];

export const DEFAULT_SERVICOS: ServicoRealizado[] = [
  {
    id_servico: 1,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-01',
    periodo: '02 Horas de laboratório',
    qtde_horas: 2.0,
    descricao_servicos: 'Formatação, instalação do sistema operacional e softwares essenciais, configurado PC para uso no caixa da loja Osasco.',
  },
  {
    id_servico: 2,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-02',
    periodo: '12:00 às 16:00 Horas',
    qtde_horas: 4.0,
    descricao_servicos: 'Passagem 4 cabos de rede K&T, projeto Sr. Emerson.',
  },
  {
    id_servico: 3,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-02',
    periodo: '10:00 às 12:00 Horas',
    qtde_horas: 2.0,
    descricao_servicos: 'Passagem cabo de rede, fixação eletroduto, crimpagem keystone ponto de rede Router - Sr. Rafael RC Plast.',
  },
  {
    id_servico: 4,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-04',
    periodo: '10:00 às 16:00 Horas',
    qtde_horas: 6.0,
    descricao_servicos: '- Passagem 2 cabos de rede adicionais a pedido Sr. Emerson.\n- Fixação, montagem caixa de passagem, instalação switch 8 portas gigabit, crimpagem cabos de rede.\n- Fixação, crimpagem 3 pontos de rede.',
  },
  {
    id_servico: 5,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-09',
    periodo: '10:00 às 13:00 Horas',
    qtde_horas: 3.0,
    descricao_servicos: '- Fixação eletroduto, passagem cabos de rede.\n- Fixação, crimpagem 3 pontos de rede.',
  },
  {
    id_servico: 6,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-10',
    periodo: '02 Horas de laboratório',
    qtde_horas: 2.0,
    descricao_servicos: '- Formatação, instalação do sistema operacional e softwares essenciais, configurado PC HP para uso na loja Osasco, usuário "loja03".',
  },
  {
    id_servico: 7,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-11',
    periodo: '12:20 às 16:00 Horas',
    qtde_horas: 3.67,
    descricao_servicos: '- Entrega PC Loja, configurado usuário "Loja03".\n- Configuração HP All in One para uso em Minas Gerais.\n- Crimpagem cabo de rede impressora Depto. Adm.\n- Ajuste nas configurações do teclado estação de trabalho Sra. Vitória.\n- Ajuste nas configurações do teclado estação de trabalho Depto. Vendas.\n- Verificação notebook Sr. Laurindo.\n- Auxílio Srta. Adriana na configuração de mensagem de férias no e-mail.\n- Verificação dos vencimentos de serviços no portal GoDaddy.\n- Retirada 4 nobreaks e 2 PCs para orçamento em laboratório.',
  },
  {
    id_servico: 8,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-11',
    periodo: '11:00 às 12:00 Horas',
    qtde_horas: 1.0,
    descricao_servicos: '- Atendido suporte técnico solicitado pela Srta. Patricia, sem sinal de internet.\n- Ajuste nas configurações do roteador para acesso à internet provedor Vivo, provedor Claro sem sinal.',
  },
  {
    id_servico: 9,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-16',
    periodo: '09:00 às 13:30 Horas',
    qtde_horas: 4.5,
    descricao_servicos: '- Atendido suporte técnico solicitado pelo Sr. Charles - Loja Osasco.\n- Substituição do PC do caixa, backup, restauração do perfil de usuário, instalação e compartilhamento da impressora multifuncional Epson, instalação nas demais estações da loja.',
  },
  {
    id_servico: 10,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-22',
    periodo: '04 Horas de laboratório',
    qtde_horas: 4.0,
    descricao_servicos: '- Formatação, instalação sistema operacional, softwares essenciais, configuração perfil usuário: vendas em 2 estações de trabalho HP.',
  },
  {
    id_servico: 11,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-23',
    periodo: '08:30 às 13:30 Horas',
    qtde_horas: 5.0,
    descricao_servicos: '- Atendido chamado técnico solicitado pela Sra. Fernanda Oliveira - Loja Incompany.\n- Configuração novo PC All in One Dell, instalação dos softwares essenciais, configuração do perfil de usuário e acesso às pastas da rede, impressoras da rede.\n- Auxílio Sra. Monica na senha de acesso aos arquivos enviados para a contabilidade, modelos de e-mails.',
  },
  {
    id_servico: 12,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-25',
    periodo: '11:00 às 14:30 Horas',
    qtde_horas: 3.5,
    descricao_servicos: '- Atendido chamado técnico solicitado pelo Sr. Charles - Loja Osasco.\n- Passagem cabo de rede para criação de ponto de rede no estoque da loja.',
  },
  {
    id_servico: 13,
    id_cliente: 4,
    id_unidade: null,
    data_visita: '2026-09-28',
    periodo: '13:00 às 17:00 Horas',
    qtde_horas: 4.0,
    descricao_servicos: '- Entrega 2 estações de trabalho HP, Depto. Vendas.\n- Verificação notebook Sra. Priscila, atualização dos drivers, sistema operacional, identificado problema na placa de som.\n- Ajuste na configuração do e-mail Sra. Jeane.\n- Verificação PC All in One HP, Juco, retirado para formatação em laboratório.\n- Retirado toners impressora colorida HP para análise em laboratório.',
  },
  {
    id_servico: 14,
    id_cliente: 5,
    id_unidade: 8,
    data_visita: '2026-09-24',
    periodo: '01 Hora suporte remoto',
    qtde_horas: 1.0,
    descricao_servicos: '- Atendido suporte técnico remoto solicitado pela Sra. Andreia - Unidade Palmas.\n- Configuração do acesso à VPN dados do servidor Matriz.',
  },
  {
    id_servico: 15,
    id_cliente: 5,
    id_unidade: 9,
    data_visita: '2026-09-01',
    periodo: '08:45 às 17:00 Horas',
    qtde_horas: 8.25,
    descricao_servicos: '- Criação da caixa postal: expedicaocba@favorita.com.br.\n- Criação acesso SFTP cliente Mahle a pedido Sr. Sidney - Depto. Faturamento.\n- Solicitação 369 - Fernanda - Depto. Torre de controle.\n- Verificação TI370, detectado problema na placa mãe, passado orçamento.\n- Verificação TI363, efetuado a troca do SSD por outro usado, formatado e reinstalado sistema, configurado para setor operacional.\n- Retirado impressora TI350 para troca do display.',
  },
];

let memoryDb: DatabaseSchema | null = null;

export function isSqlConfigured(): boolean {
  return !!(process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME);
}

export function getActiveBackendName(): 'supabase' | 'cloudsql' | 'local' {
  if (isSupabaseConfigured()) return 'supabase';
  if (isSqlConfigured()) return 'cloudsql';
  return 'local';
}

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase(): DatabaseSchema {
  if (memoryDb) return memoryDb;
  try {
    ensureDataDirectory();
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(content);
      return memoryDb!;
    }
  } catch (err) {
    console.error('Erro ao ler DB local:', err);
  }

  memoryDb = {
    clientes: [...DEFAULT_CLIENTES],
    unidades: [...DEFAULT_UNIDADES],
    servicos: [...DEFAULT_SERVICOS],
  };
  saveDatabase(memoryDb);
  return memoryDb;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    memoryDb = data;
  } catch (err) {
    console.error('Erro ao salvar DB local:', err);
    memoryDb = data;
  }
}

// ==========================================
// CLIENTES
// ==========================================

export async function getClientes(): Promise<Cliente[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('clientes')
        .select('*')
        .order('nome_empresa', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data as Cliente[];
      }
    } catch (err) {
      console.warn('Tentativa no Supabase falhou, tentando fallback:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      const rows = await db
        .select()
        .from(schema.clientes)
        .orderBy(asc(schema.clientes.nome_empresa));
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id_cliente: r.id_cliente,
          nome_empresa: r.nome_empresa,
          contato_ac: r.contato_ac,
          created_at: r.created_at ? r.created_at.toISOString() : undefined,
        }));
      }
    } catch (error) {
      console.warn('Falha ao consultar clientes no SQL, usando fallback local:', error);
    }
  }

  const localDb = loadDatabase();
  return [...localDb.clientes].sort((a, b) => a.nome_empresa.localeCompare(b.nome_empresa));
}

export async function getClienteById(id_cliente: number): Promise<Cliente | undefined> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('clientes')
        .select('*')
        .eq('id_cliente', id_cliente)
        .maybeSingle();
      if (!error && data) return data as Cliente;
    } catch (err) {
      console.warn('Supabase getClienteById falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      const rows = await db
        .select()
        .from(schema.clientes)
        .where(eq(schema.clientes.id_cliente, id_cliente));
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id_cliente: r.id_cliente,
          nome_empresa: r.nome_empresa,
          contato_ac: r.contato_ac,
          created_at: r.created_at ? r.created_at.toISOString() : undefined,
        };
      }
    } catch (error) {
      console.warn('SQL getClienteById falhou:', error);
    }
  }

  const localDb = loadDatabase();
  return localDb.clientes.find((c) => c.id_cliente === id_cliente);
}

export async function createCliente(dados: Omit<Cliente, 'id_cliente'>): Promise<Cliente> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: maxRow } = await sb
        .from('clientes')
        .select('id_cliente')
        .order('id_cliente', { ascending: false })
        .limit(1);
      const nextId = (maxRow && maxRow[0] && maxRow[0].id_cliente ? Number(maxRow[0].id_cliente) : 0) + 1;

      const { data, error } = await sb
        .from('clientes')
        .insert({
          id_cliente: nextId,
          nome_empresa: dados.nome_empresa.trim(),
          contato_ac: dados.contato_ac.trim(),
        })
        .select()
        .single();
      if (!error && data) {
        try {
          const localDb = loadDatabase();
          localDb.clientes.push(data as Cliente);
          saveDatabase(localDb);
        } catch {
          // ignora em Vercel
        }
        return data as Cliente;
      }
    } catch (err) {
      console.warn('Supabase createCliente falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      const rows = await db
        .insert(schema.clientes)
        .values({
          nome_empresa: dados.nome_empresa.trim(),
          contato_ac: dados.contato_ac.trim(),
        })
        .returning();
      const r = rows[0];
      return {
        id_cliente: r.id_cliente,
        nome_empresa: r.nome_empresa,
        contato_ac: r.contato_ac,
        created_at: r.created_at ? r.created_at.toISOString() : undefined,
      };
    } catch (error) {
      console.warn('SQL createCliente falhou:', error);
    }
  }

  const localDb = loadDatabase();
  const nextId = localDb.clientes.length > 0 ? Math.max(...localDb.clientes.map((c) => c.id_cliente)) + 1 : 1;
  const novo: Cliente = {
    id_cliente: nextId,
    nome_empresa: dados.nome_empresa.trim(),
    contato_ac: dados.contato_ac.trim(),
    created_at: new Date().toISOString(),
  };
  localDb.clientes.push(novo);
  saveDatabase(localDb);
  return novo;
}

export async function updateCliente(
  id_cliente: number,
  dados: Partial<Omit<Cliente, 'id_cliente'>>
): Promise<Cliente | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('clientes')
        .update(dados)
        .eq('id_cliente', id_cliente)
        .select()
        .single();
      if (!error && data) return data as Cliente;
    } catch (err) {
      console.warn('Supabase updateCliente falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      const updateData: Partial<typeof schema.clientes.$inferInsert> = {};
      if (dados.nome_empresa) updateData.nome_empresa = dados.nome_empresa.trim();
      if (dados.contato_ac) updateData.contato_ac = dados.contato_ac.trim();

      const rows = await db
        .update(schema.clientes)
        .set(updateData)
        .where(eq(schema.clientes.id_cliente, id_cliente))
        .returning();
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id_cliente: r.id_cliente,
          nome_empresa: r.nome_empresa,
          contato_ac: r.contato_ac,
          created_at: r.created_at ? r.created_at.toISOString() : undefined,
        };
      }
    } catch (error) {
      console.warn('SQL updateCliente falhou:', error);
    }
  }

  const localDb = loadDatabase();
  const index = localDb.clientes.findIndex((c) => c.id_cliente === id_cliente);
  if (index === -1) return null;
  localDb.clientes[index] = {
    ...localDb.clientes[index],
    ...(dados.nome_empresa ? { nome_empresa: dados.nome_empresa.trim() } : {}),
    ...(dados.contato_ac ? { contato_ac: dados.contato_ac.trim() } : {}),
  };
  saveDatabase(localDb);
  return localDb.clientes[index];
}

export async function deleteCliente(id_cliente: number): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('clientes').delete().eq('id_cliente', id_cliente);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase deleteCliente falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      await db.delete(schema.clientes).where(eq(schema.clientes.id_cliente, id_cliente));
      return true;
    } catch (error) {
      console.warn('SQL deleteCliente falhou:', error);
    }
  }

  const localDb = loadDatabase();
  const index = localDb.clientes.findIndex((c) => c.id_cliente === id_cliente);
  if (index === -1) return false;
  localDb.clientes.splice(index, 1);
  localDb.unidades = localDb.unidades.filter((u) => u.id_cliente !== id_cliente);
  saveDatabase(localDb);
  return true;
}

// ==========================================
// UNIDADES
// ==========================================

export async function getUnidades(id_cliente?: number): Promise<Unidade[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      let query = sb.from('unidades').select('*');
      if (id_cliente) query = query.eq('id_cliente', id_cliente);
      const { data, error } = await query.order('nome_unidade', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) return data as Unidade[];
    } catch (err) {
      console.warn('Supabase getUnidades falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      const query = db.select().from(schema.unidades);
      const rows = id_cliente
        ? await query.where(eq(schema.unidades.id_cliente, id_cliente)).orderBy(asc(schema.unidades.nome_unidade))
        : await query.orderBy(asc(schema.unidades.nome_unidade));
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id_unidade: r.id_unidade,
          id_cliente: r.id_cliente,
          nome_unidade: r.nome_unidade,
          created_at: r.created_at ? r.created_at.toISOString() : undefined,
        }));
      }
    } catch (error) {
      console.warn('SQL getUnidades falhou:', error);
    }
  }

  const localDb = loadDatabase();
  if (id_cliente) {
    return localDb.unidades
      .filter((u) => u.id_cliente === id_cliente)
      .sort((a, b) => a.nome_unidade.localeCompare(b.nome_unidade));
  }
  return [...localDb.unidades].sort((a, b) => a.nome_unidade.localeCompare(b.nome_unidade));
}

export async function createUnidade(dados: Omit<Unidade, 'id_unidade'>): Promise<Unidade> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: maxRow } = await sb
        .from('unidades')
        .select('id_unidade')
        .order('id_unidade', { ascending: false })
        .limit(1);
      const nextId = (maxRow && maxRow[0] && maxRow[0].id_unidade ? Number(maxRow[0].id_unidade) : 0) + 1;

      const { data, error } = await sb
        .from('unidades')
        .insert({
          id_unidade: nextId,
          id_cliente: Number(dados.id_cliente),
          nome_unidade: dados.nome_unidade.trim(),
        })
        .select()
        .single();
      if (!error && data) {
        try {
          const localDb = loadDatabase();
          localDb.unidades.push(data as Unidade);
          saveDatabase(localDb);
        } catch {
          // ignora em Vercel
        }
        return data as Unidade;
      }
    } catch (err) {
      console.warn('Supabase createUnidade falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      const rows = await db
        .insert(schema.unidades)
        .values({
          id_cliente: Number(dados.id_cliente),
          nome_unidade: dados.nome_unidade.trim(),
        })
        .returning();
      const r = rows[0];
      return {
        id_unidade: r.id_unidade,
        id_cliente: r.id_cliente,
        nome_unidade: r.nome_unidade,
        created_at: r.created_at ? r.created_at.toISOString() : undefined,
      };
    } catch (error) {
      console.warn('SQL createUnidade falhou:', error);
    }
  }

  const localDb = loadDatabase();
  const nextId = localDb.unidades.length > 0 ? Math.max(...localDb.unidades.map((u) => u.id_unidade)) + 1 : 1;
  const nova: Unidade = {
    id_unidade: nextId,
    id_cliente: Number(dados.id_cliente),
    nome_unidade: dados.nome_unidade.trim(),
    created_at: new Date().toISOString(),
  };
  localDb.unidades.push(nova);
  saveDatabase(localDb);
  return nova;
}

export async function updateUnidade(
  id_unidade: number,
  dados: Partial<Omit<Unidade, 'id_unidade'>>
): Promise<Unidade | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('unidades')
        .update(dados)
        .eq('id_unidade', id_unidade)
        .select()
        .single();
      if (!error && data) return data as Unidade;
    } catch (err) {
      console.warn('Supabase updateUnidade falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      const updateData: Partial<typeof schema.unidades.$inferInsert> = {};
      if (dados.id_cliente !== undefined) updateData.id_cliente = Number(dados.id_cliente);
      if (dados.nome_unidade) updateData.nome_unidade = dados.nome_unidade.trim();

      const rows = await db
        .update(schema.unidades)
        .set(updateData)
        .where(eq(schema.unidades.id_unidade, id_unidade))
        .returning();
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id_unidade: r.id_unidade,
          id_cliente: r.id_cliente,
          nome_unidade: r.nome_unidade,
          created_at: r.created_at ? r.created_at.toISOString() : undefined,
        };
      }
    } catch (error) {
      console.warn('SQL updateUnidade falhou:', error);
    }
  }

  const localDb = loadDatabase();
  const index = localDb.unidades.findIndex((u) => u.id_unidade === id_unidade);
  if (index === -1) return null;
  localDb.unidades[index] = {
    ...localDb.unidades[index],
    ...(dados.id_cliente !== undefined ? { id_cliente: Number(dados.id_cliente) } : {}),
    ...(dados.nome_unidade ? { nome_unidade: dados.nome_unidade.trim() } : {}),
  };
  saveDatabase(localDb);
  return localDb.unidades[index];
}

export async function deleteUnidade(id_unidade: number): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('unidades').delete().eq('id_unidade', id_unidade);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase deleteUnidade falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      await db.delete(schema.unidades).where(eq(schema.unidades.id_unidade, id_unidade));
      return true;
    } catch (error) {
      console.warn('SQL deleteUnidade falhou:', error);
    }
  }

  const localDb = loadDatabase();
  const index = localDb.unidades.findIndex((u) => u.id_unidade === id_unidade);
  if (index === -1) return false;
  localDb.unidades.splice(index, 1);
  saveDatabase(localDb);
  return true;
}

// ==========================================
// SERVIÇOS
// ==========================================

export async function getServicos(filtro?: Partial<FiltroRelatorio>): Promise<ServicoRealizadoCompleto[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      let query = sb.from('servicos_realizados').select('*');
      if (filtro?.id_cliente) query = query.eq('id_cliente', filtro.id_cliente);
      if (filtro?.id_unidade) query = query.eq('id_unidade', filtro.id_unidade);
      if (filtro?.data_inicio) query = query.gte('data_visita', filtro.data_inicio);
      if (filtro?.data_fim) query = query.lte('data_visita', filtro.data_fim);

      const { data: servicosData, error } = await query
        .order('data_visita', { ascending: true })
        .order('id_servico', { ascending: true });

      if (!error && Array.isArray(servicosData)) {
        if (servicosData.length === 0 && (filtro?.id_cliente || filtro?.data_inicio || filtro?.data_fim || filtro?.id_unidade)) {
          return [];
        }

        if (servicosData.length > 0) {
          // Busca clientes e unidades para compor os nomes com segurança
          const [cliRes, uniRes] = await Promise.all([
            sb.from('clientes').select('id_cliente, nome_empresa, contato_ac'),
            sb.from('unidades').select('id_unidade, nome_unidade'),
          ]);

          const localDb = loadDatabase();
          const cliMap = new Map((cliRes.data || []).map((c: any) => [c.id_cliente, c]));
          const uniMap = new Map((uniRes.data || []).map((u: any) => [u.id_unidade, u.nome_unidade]));

          return servicosData.map((r: any) => {
            const cli = cliMap.get(r.id_cliente) || localDb.clientes.find((c) => c.id_cliente === r.id_cliente);
            const nomeUni = r.id_unidade
              ? (uniMap.get(r.id_unidade) || localDb.unidades.find((u) => u.id_unidade === r.id_unidade)?.nome_unidade)
              : undefined;

            return {
              id_servico: r.id_servico,
              id_cliente: r.id_cliente,
              id_unidade: r.id_unidade,
              data_visita: r.data_visita,
              periodo: r.periodo,
              qtde_horas: Number(r.qtde_horas) || 0,
              descricao_servicos: r.descricao_servicos,
              created_at: r.created_at,
              nome_empresa: cli?.nome_empresa || 'Cliente Desconhecido',
              contato_ac: cli?.contato_ac || '',
              nome_unidade: nomeUni,
            };
          });
        }
      }
    } catch (err) {
      console.warn('Supabase getServicos falhou, tentando fallback:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      const conditions = [];
      if (filtro?.id_cliente) {
        conditions.push(eq(schema.servicosRealizados.id_cliente, Number(filtro.id_cliente)));
      }
      if (filtro?.id_unidade !== undefined && filtro?.id_unidade !== null && filtro?.id_unidade !== 0) {
        conditions.push(eq(schema.servicosRealizados.id_unidade, Number(filtro.id_unidade)));
      }
      if (filtro?.data_inicio) {
        conditions.push(gte(schema.servicosRealizados.data_visita, filtro.data_inicio));
      }
      if (filtro?.data_fim) {
        conditions.push(lte(schema.servicosRealizados.data_visita, filtro.data_fim));
      }

      const rows = await db
        .select({
          id_servico: schema.servicosRealizados.id_servico,
          id_cliente: schema.servicosRealizados.id_cliente,
          id_unidade: schema.servicosRealizados.id_unidade,
          data_visita: schema.servicosRealizados.data_visita,
          periodo: schema.servicosRealizados.periodo,
          qtde_horas: schema.servicosRealizados.qtde_horas,
          descricao_servicos: schema.servicosRealizados.descricao_servicos,
          created_at: schema.servicosRealizados.created_at,
          nome_empresa: schema.clientes.nome_empresa,
          contato_ac: schema.clientes.contato_ac,
          nome_unidade: schema.unidades.nome_unidade,
        })
        .from(schema.servicosRealizados)
        .leftJoin(schema.clientes, eq(schema.servicosRealizados.id_cliente, schema.clientes.id_cliente))
        .leftJoin(schema.unidades, eq(schema.servicosRealizados.id_unidade, schema.unidades.id_unidade))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(schema.servicosRealizados.data_visita), asc(schema.servicosRealizados.id_servico));

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id_servico: r.id_servico,
          id_cliente: r.id_cliente,
          id_unidade: r.id_unidade,
          data_visita: r.data_visita,
          periodo: r.periodo,
          qtde_horas: r.qtde_horas,
          descricao_servicos: r.descricao_servicos,
          created_at: r.created_at ? r.created_at.toISOString() : undefined,
          nome_empresa: r.nome_empresa || 'Cliente Desconhecido',
          contato_ac: r.contato_ac || '',
          nome_unidade: r.nome_unidade || undefined,
        }));
      }
    } catch (error) {
      console.warn('SQL getServicos falhou:', error);
    }
  }

  const localDb = loadDatabase();
  let resultado = [...localDb.servicos];

  if (filtro?.id_cliente) {
    resultado = resultado.filter((s) => s.id_cliente === Number(filtro.id_cliente));
  }
  if (filtro?.id_unidade !== undefined && filtro?.id_unidade !== null && filtro?.id_unidade !== 0) {
    resultado = resultado.filter((s) => s.id_unidade === Number(filtro.id_unidade));
  }
  if (filtro?.data_inicio) {
    resultado = resultado.filter((s) => s.data_visita >= filtro.data_inicio!);
  }
  if (filtro?.data_fim) {
    resultado = resultado.filter((s) => s.data_visita <= filtro.data_fim!);
  }

  resultado.sort((a, b) => {
    const cmp = a.data_visita.localeCompare(b.data_visita);
    if (cmp !== 0) return cmp;
    return a.id_servico - b.id_servico;
  });

  return resultado.map((servico) => {
    const cliente = localDb.clientes.find((c) => c.id_cliente === servico.id_cliente);
    const unidade = servico.id_unidade ? localDb.unidades.find((u) => u.id_unidade === servico.id_unidade) : null;
    return {
      ...servico,
      nome_empresa: cliente?.nome_empresa || 'Cliente Desconhecido',
      contato_ac: cliente?.contato_ac || '',
      nome_unidade: unidade?.nome_unidade || undefined,
    };
  });
}

export async function getServicoById(id_servico: number): Promise<ServicoRealizadoCompleto | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('servicos_realizados')
        .select('*')
        .eq('id_servico', id_servico)
        .maybeSingle();
      if (!error && data) {
        const [cli, uni] = await Promise.all([
          getClienteById(data.id_cliente),
          data.id_unidade ? getUnidades(data.id_cliente) : Promise.resolve([]),
        ]);
        const unidadeObj = (uni || []).find((u) => u.id_unidade === data.id_unidade);
        return {
          id_servico: data.id_servico,
          id_cliente: data.id_cliente,
          id_unidade: data.id_unidade,
          data_visita: data.data_visita,
          periodo: data.periodo,
          qtde_horas: Number(data.qtde_horas) || 0,
          descricao_servicos: data.descricao_servicos,
          created_at: data.created_at,
          nome_empresa: cli?.nome_empresa,
          contato_ac: cli?.contato_ac,
          nome_unidade: unidadeObj?.nome_unidade,
        };
      }
    } catch (err) {
      console.warn('Supabase getServicoById falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      const rows = await db
        .select({
          id_servico: schema.servicosRealizados.id_servico,
          id_cliente: schema.servicosRealizados.id_cliente,
          id_unidade: schema.servicosRealizados.id_unidade,
          data_visita: schema.servicosRealizados.data_visita,
          periodo: schema.servicosRealizados.periodo,
          qtde_horas: schema.servicosRealizados.qtde_horas,
          descricao_servicos: schema.servicosRealizados.descricao_servicos,
          created_at: schema.servicosRealizados.created_at,
          nome_empresa: schema.clientes.nome_empresa,
          contato_ac: schema.clientes.contato_ac,
          nome_unidade: schema.unidades.nome_unidade,
        })
        .from(schema.servicosRealizados)
        .leftJoin(schema.clientes, eq(schema.servicosRealizados.id_cliente, schema.clientes.id_cliente))
        .leftJoin(schema.unidades, eq(schema.servicosRealizados.id_unidade, schema.unidades.id_unidade))
        .where(eq(schema.servicosRealizados.id_servico, id_servico));

      if (rows.length > 0) {
        const r = rows[0];
        return {
          id_servico: r.id_servico,
          id_cliente: r.id_cliente,
          id_unidade: r.id_unidade,
          data_visita: r.data_visita,
          periodo: r.periodo,
          qtde_horas: r.qtde_horas,
          descricao_servicos: r.descricao_servicos,
          created_at: r.created_at ? r.created_at.toISOString() : undefined,
          nome_empresa: r.nome_empresa || undefined,
          contato_ac: r.contato_ac || undefined,
          nome_unidade: r.nome_unidade || undefined,
        };
      }
    } catch (error) {
      console.warn('SQL getServicoById falhou:', error);
    }
  }

  const localDb = loadDatabase();
  const servico = localDb.servicos.find((s) => s.id_servico === id_servico);
  if (!servico) return null;
  const cliente = localDb.clientes.find((c) => c.id_cliente === servico.id_cliente);
  const unidade = servico.id_unidade ? localDb.unidades.find((u) => u.id_unidade === servico.id_unidade) : null;
  return {
    ...servico,
    nome_empresa: cliente?.nome_empresa,
    contato_ac: cliente?.contato_ac,
    nome_unidade: unidade?.nome_unidade,
  };
}

export async function createServico(dados: Omit<ServicoRealizado, 'id_servico'>): Promise<ServicoRealizadoCompleto> {
  const sb = getSupabase();
  if (sb) {
    try {
      // Obter o próximo id_servico para garantir que funcione mesmo se a sequence do Postgres estiver descompassada
      const { data: maxRow } = await sb
        .from('servicos_realizados')
        .select('id_servico')
        .order('id_servico', { ascending: false })
        .limit(1);
      const nextId = (maxRow && maxRow[0] && maxRow[0].id_servico ? Number(maxRow[0].id_servico) : 0) + 1;

      const payload = {
        id_servico: nextId,
        id_cliente: Number(dados.id_cliente),
        id_unidade: dados.id_unidade ? Number(dados.id_unidade) : null,
        data_visita: dados.data_visita,
        periodo: dados.periodo.trim(),
        qtde_horas: Number(dados.qtde_horas) || 0,
        descricao_servicos: dados.descricao_servicos.trim(),
      };

      const { data, error } = await sb
        .from('servicos_realizados')
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        // Espelha no db local se possível (tolerante a ambiente Vercel somente-leitura)
        try {
          const localDb = loadDatabase();
          localDb.servicos.push({
            id_servico: data.id_servico,
            id_cliente: data.id_cliente,
            id_unidade: data.id_unidade,
            data_visita: data.data_visita,
            periodo: data.periodo,
            qtde_horas: Number(data.qtde_horas) || 0,
            descricao_servicos: data.descricao_servicos,
            created_at: data.created_at,
          });
          saveDatabase(localDb);
        } catch {
          // ignora em Vercel
        }

        const completo = await getServicoById(data.id_servico);
        if (completo) return completo;

        // Se getServicoById falhar na busca dos dados relacionados, retorna com fallback seguro
        const [cli, uni] = await Promise.all([
          getClienteById(data.id_cliente),
          data.id_unidade ? getUnidades(data.id_cliente) : Promise.resolve([]),
        ]);
        const unidadeObj = (uni || []).find((u) => u.id_unidade === data.id_unidade);
        return {
          id_servico: data.id_servico,
          id_cliente: data.id_cliente,
          id_unidade: data.id_unidade,
          data_visita: data.data_visita,
          periodo: data.periodo,
          qtde_horas: Number(data.qtde_horas) || 0,
          descricao_servicos: data.descricao_servicos,
          created_at: data.created_at,
          nome_empresa: cli?.nome_empresa || 'Cliente',
          contato_ac: cli?.contato_ac || '',
          nome_unidade: unidadeObj?.nome_unidade,
        };
      } else {
        console.error('Supabase createServico erro:', error);
      }
    } catch (err) {
      console.warn('Supabase createServico falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      const rows = await db
        .insert(schema.servicosRealizados)
        .values({
          id_cliente: Number(dados.id_cliente),
          id_unidade: dados.id_unidade ? Number(dados.id_unidade) : null,
          data_visita: dados.data_visita,
          periodo: dados.periodo.trim(),
          qtde_horas: Number(dados.qtde_horas) || 0,
          descricao_servicos: dados.descricao_servicos.trim(),
        })
        .returning();
      const r = rows[0];
      const completo = await getServicoById(r.id_servico);
      if (completo) return completo;
    } catch (error) {
      console.warn('SQL createServico falhou:', error);
    }
  }

  const localDb = loadDatabase();
  const nextId = localDb.servicos.length > 0 ? Math.max(...localDb.servicos.map((s) => s.id_servico)) + 1 : 1;
  const novo: ServicoRealizado = {
    id_servico: nextId,
    id_cliente: Number(dados.id_cliente),
    id_unidade: dados.id_unidade ? Number(dados.id_unidade) : null,
    data_visita: dados.data_visita,
    periodo: dados.periodo.trim(),
    qtde_horas: Number(dados.qtde_horas) || 0,
    descricao_servicos: dados.descricao_servicos.trim(),
    created_at: new Date().toISOString(),
  };
  localDb.servicos.push(novo);
  saveDatabase(localDb);
  return (await getServicoById(novo.id_servico))!;
}

export async function updateServico(
  id_servico: number,
  dados: Partial<Omit<ServicoRealizado, 'id_servico'>>
): Promise<ServicoRealizadoCompleto | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const updatePayload: Record<string, any> = {};
      if (dados.id_cliente !== undefined) updatePayload.id_cliente = Number(dados.id_cliente);
      if (dados.id_unidade !== undefined) updatePayload.id_unidade = dados.id_unidade ? Number(dados.id_unidade) : null;
      if (dados.data_visita !== undefined) updatePayload.data_visita = dados.data_visita;
      if (dados.periodo !== undefined) updatePayload.periodo = dados.periodo.trim();
      if (dados.qtde_horas !== undefined) updatePayload.qtde_horas = Number(dados.qtde_horas);
      if (dados.descricao_servicos !== undefined) updatePayload.descricao_servicos = dados.descricao_servicos.trim();

      const { error } = await sb
        .from('servicos_realizados')
        .update(updatePayload)
        .eq('id_servico', id_servico);
      if (!error) {
        try {
          const localDb = loadDatabase();
          const index = localDb.servicos.findIndex((s) => s.id_servico === id_servico);
          if (index !== -1) {
            localDb.servicos[index] = { ...localDb.servicos[index], ...updatePayload };
            saveDatabase(localDb);
          }
        } catch {
          // ignora em Vercel
        }
        return await getServicoById(id_servico);
      }
    } catch (err) {
      console.warn('Supabase updateServico falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      const updateData: Partial<typeof schema.servicosRealizados.$inferInsert> = {};
      if (dados.id_cliente !== undefined) updateData.id_cliente = Number(dados.id_cliente);
      if (dados.id_unidade !== undefined) updateData.id_unidade = dados.id_unidade ? Number(dados.id_unidade) : null;
      if (dados.data_visita) updateData.data_visita = dados.data_visita;
      if (dados.periodo !== undefined) updateData.periodo = dados.periodo.trim();
      if (dados.qtde_horas !== undefined) updateData.qtde_horas = Number(dados.qtde_horas);
      if (dados.descricao_servicos !== undefined) updateData.descricao_servicos = dados.descricao_servicos.trim();

      await db
        .update(schema.servicosRealizados)
        .set(updateData)
        .where(eq(schema.servicosRealizados.id_servico, id_servico));

      return await getServicoById(id_servico);
    } catch (error) {
      console.warn('SQL updateServico falhou:', error);
    }
  }

  const localDb = loadDatabase();
  const index = localDb.servicos.findIndex((s) => s.id_servico === id_servico);
  if (index === -1) return null;
  localDb.servicos[index] = {
    ...localDb.servicos[index],
    ...(dados.id_cliente !== undefined ? { id_cliente: Number(dados.id_cliente) } : {}),
    ...(dados.id_unidade !== undefined ? { id_unidade: dados.id_unidade ? Number(dados.id_unidade) : null } : {}),
    ...(dados.data_visita ? { data_visita: dados.data_visita } : {}),
    ...(dados.periodo !== undefined ? { periodo: dados.periodo.trim() } : {}),
    ...(dados.qtde_horas !== undefined ? { qtde_horas: Number(dados.qtde_horas) } : {}),
    ...(dados.descricao_servicos !== undefined ? { descricao_servicos: dados.descricao_servicos.trim() } : {}),
  };
  saveDatabase(localDb);
  return await getServicoById(id_servico);
}

export async function deleteServico(id_servico: number): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('servicos_realizados').delete().eq('id_servico', id_servico);
      if (!error) {
        try {
          const localDb = loadDatabase();
          localDb.servicos = localDb.servicos.filter((s) => s.id_servico !== id_servico);
          saveDatabase(localDb);
        } catch {
          // ignora em Vercel
        }
        return true;
      }
    } catch (err) {
      console.warn('Supabase deleteServico falhou:', err);
    }
  }

  if (isSqlConfigured()) {
    try {
      await db.delete(schema.servicosRealizados).where(eq(schema.servicosRealizados.id_servico, id_servico));
      return true;
    } catch (error) {
      console.warn('SQL deleteServico falhou:', error);
    }
  }

  const localDb = loadDatabase();
  const index = localDb.servicos.findIndex((s) => s.id_servico === id_servico);
  if (index === -1) return false;
  localDb.servicos.splice(index, 1);
  saveDatabase(localDb);
  return true;
}

export async function resetDatabase(): Promise<DatabaseSchema> {
  memoryDb = {
    clientes: [...DEFAULT_CLIENTES],
    unidades: [...DEFAULT_UNIDADES],
    servicos: [...DEFAULT_SERVICOS],
  };
  saveDatabase(memoryDb);
  return memoryDb;
}
