-- ============================================================
-- FERDATA INFORMÁTICA - ASSISTÊNCIA TÉCNICA
-- Sistema de Gestão de Serviços & Relatórios Técnicos
-- Script DDL: SQLite & PostgreSQL Compatível
-- ============================================================

-- 1. TABELA CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_empresa VARCHAR(150) NOT NULL,
    contato_ac VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA UNIDADES (Filiais de clientes multi-unidade)
CREATE TABLE IF NOT EXISTS unidades (
    id_unidade INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    nome_unidade VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
);

-- 3. TABELA SERVICOS_REALIZADOS
CREATE TABLE IF NOT EXISTS servicos_realizados (
    id_servico INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_unidade INTEGER NULL,
    data_visita DATE NOT NULL,
    periodo VARCHAR(100) NOT NULL,
    qtde_horas DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    descricao_servicos TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    FOREIGN KEY (id_unidade) REFERENCES unidades(id_unidade) ON DELETE SET NULL
);

-- Índices para otimização de consultas e relatórios por período
CREATE INDEX IF NOT EXISTS idx_servicos_cliente_data ON servicos_realizados (id_cliente, data_visita);
CREATE INDEX IF NOT EXISTS idx_servicos_unidade ON servicos_realizados (id_unidade);
CREATE INDEX IF NOT EXISTS idx_unidades_cliente ON unidades (id_cliente);
