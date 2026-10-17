-- ============================================================
-- FERDATA INFORMÁTICA - MIGRAÇÃO DE USUÁRIOS PARA SUPABASE
-- Adiciona suporte a login próprio e senha na tabela users
-- ============================================================

-- 1. Garante que as colunas username e password_hash existam
ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;

-- 2. Cria índice para username caso não exista
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users" ("username");

-- 3. Garante permissões RLS no Supabase
ALTER TABLE IF EXISTS "users" ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Permitir leitura para todos'
    ) THEN
        CREATE POLICY "Permitir leitura para todos" ON "users" FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Permitir escrita para todos'
    ) THEN
        CREATE POLICY "Permitir escrita para todos" ON "users" FOR ALL USING (true);
    END IF;
END $$;
