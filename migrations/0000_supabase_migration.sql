-- ============================================================
-- FERDATA INFORMÁTICA - SUPABASE / POSTGRESQL MIGRATION
-- Migration 0000: Initial Schema
-- ============================================================

-- 1. Habilitar extensões úteis se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Usuários (compatível com Supabase Auth / Autenticação Própria)
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "uid" TEXT NOT NULL UNIQUE,
    "username" TEXT UNIQUE,
    "password_hash" TEXT,
    "email" TEXT,
    "name" TEXT,
    "role" TEXT DEFAULT 'admin',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garante colunas adicionais caso a tabela users já tenha sido criada anteriormente
ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;

-- 3. Tabela Clientes
CREATE TABLE IF NOT EXISTS "clientes" (
    "id_cliente" SERIAL PRIMARY KEY,
    "nome_empresa" TEXT NOT NULL,
    "contato_ac" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela Unidades (Filiais de clientes multi-unidades)
CREATE TABLE IF NOT EXISTS "unidades" (
    "id_unidade" SERIAL PRIMARY KEY,
    "id_cliente" INTEGER NOT NULL,
    "nome_unidade" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT "unidades_id_cliente_fkey" 
        FOREIGN KEY ("id_cliente") 
        REFERENCES "clientes"("id_cliente") 
        ON DELETE CASCADE
);

-- 5. Tabela Serviços Realizados
CREATE TABLE IF NOT EXISTS "servicos_realizados" (
    "id_servico" SERIAL PRIMARY KEY,
    "id_cliente" INTEGER NOT NULL,
    "id_unidade" INTEGER,
    "data_visita" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "qtde_horas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "descricao_servicos" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT "servicos_id_cliente_fkey" 
        FOREIGN KEY ("id_cliente") 
        REFERENCES "clientes"("id_cliente") 
        ON DELETE RESTRICT,
    CONSTRAINT "servicos_id_unidade_fkey" 
        FOREIGN KEY ("id_unidade") 
        REFERENCES "unidades"("id_unidade") 
        ON DELETE SET NULL
);

-- 6. Tabela Configurações da Aplicação (Logotipo, Parâmetros)
CREATE TABLE IF NOT EXISTS "app_settings" (
    "id" SERIAL PRIMARY KEY,
    "setting_key" TEXT NOT NULL UNIQUE,
    "setting_value" TEXT NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Índices Otimizados para Consultas Rápidas e Relatórios
CREATE INDEX IF NOT EXISTS "idx_servicos_cliente_data" ON "servicos_realizados" ("id_cliente", "data_visita");
CREATE INDEX IF NOT EXISTS "idx_servicos_unidade" ON "servicos_realizados" ("id_unidade");
CREATE INDEX IF NOT EXISTS "idx_unidades_cliente" ON "unidades" ("id_cliente");
CREATE INDEX IF NOT EXISTS "idx_users_uid" ON "users" ("uid");

-- 8. Ativar Row Level Security (RLS) se usado no Supabase
ALTER TABLE "clientes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "unidades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "servicos_realizados" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_settings" ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS permissivas para serviço autenticado / aplicação
CREATE POLICY "Permitir leitura para todos" ON "clientes" FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para todos" ON "clientes" FOR ALL USING (true);

CREATE POLICY "Permitir leitura para todos" ON "unidades" FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para todos" ON "unidades" FOR ALL USING (true);

CREATE POLICY "Permitir leitura para todos" ON "servicos_realizados" FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para todos" ON "servicos_realizados" FOR ALL USING (true);

CREATE POLICY "Permitir leitura para todos" ON "users" FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para todos" ON "users" FOR ALL USING (true);

CREATE POLICY "Permitir leitura para todos" ON "app_settings" FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para todos" ON "app_settings" FOR ALL USING (true);
