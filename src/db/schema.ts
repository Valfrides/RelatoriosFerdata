import { pgTable, serial, text, integer, doublePrecision, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabela de Usuários (Autenticação / Supabase)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  username: text('username'),
  password_hash: text('password_hash'),
  email: text('email'),
  name: text('name'),
  role: text('role').default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela Clientes
export const clientes = pgTable('clientes', {
  id_cliente: serial('id_cliente').primaryKey(),
  nome_empresa: text('nome_empresa').notNull(),
  contato_ac: text('contato_ac').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// Tabela Unidades (Filiais)
export const unidades = pgTable('unidades', {
  id_unidade: serial('id_unidade').primaryKey(),
  id_cliente: integer('id_cliente')
    .references(() => clientes.id_cliente, { onDelete: 'cascade' })
    .notNull(),
  nome_unidade: text('nome_unidade').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// Tabela Serviços Realizados
export const servicosRealizados = pgTable('servicos_realizados', {
  id_servico: serial('id_servico').primaryKey(),
  id_cliente: integer('id_cliente')
    .references(() => clientes.id_cliente, { onDelete: 'restrict' })
    .notNull(),
  id_unidade: integer('id_unidade')
    .references(() => unidades.id_unidade, { onDelete: 'set null' }),
  data_visita: text('data_visita').notNull(),
  periodo: text('periodo').notNull(),
  qtde_horas: doublePrecision('qtde_horas').default(0).notNull(),
  descricao_servicos: text('descricao_servicos').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// Tabela de Configurações da Aplicação (ex: logotipo personalizado)
export const appSettings = pgTable('app_settings', {
  id: serial('id').primaryKey(),
  setting_key: text('setting_key').notNull().unique(),
  setting_value: text('setting_value').notNull(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Relações Drizzle ORM
export const clientesRelations = relations(clientes, ({ many }) => ({
  unidades: many(unidades),
  servicos: many(servicosRealizados),
}));

export const unidadesRelations = relations(unidades, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [unidades.id_cliente],
    references: [clientes.id_cliente],
  }),
  servicos: many(servicosRealizados),
}));

export const servicosRealizadosRelations = relations(servicosRealizados, ({ one }) => ({
  cliente: one(clientes, {
    fields: [servicosRealizados.id_cliente],
    references: [clientes.id_cliente],
  }),
  unidade: one(unidades, {
    fields: [servicosRealizados.id_unidade],
    references: [unidades.id_unidade],
  }),
}));
