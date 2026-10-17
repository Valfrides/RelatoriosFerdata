# Ferdata Informática - Integração Supabase & Migrations

Este projeto foi configurado com suporte completo a banco de dados relacional **PostgreSQL / Supabase** utilizando **Drizzle ORM** e **pg pool**.

---

## 1. Arquivos de Migrations Gerados

Foram gerados dois modelos de migração completos para seu banco de dados:

1. **`migrations/0000_supabase_migration.sql`**:
   - Compatível diretamente com o painel do **Supabase SQL Editor**.
   - Cria as tabelas `clientes`, `unidades`, `servicos_realizados`, `users` e `app_settings`.
   - Adiciona chaves estrangeiras com ações `ON DELETE CASCADE` e `ON DELETE RESTRICT`.
   - Adiciona índices otimizados para relatórios por cliente e período.
   - Configura **Row Level Security (RLS)** e políticas padrão.

2. **`drizzle/0000_initial_schema.sql`**:
   - Arquivo de migração gerenciado pelo **Drizzle Kit**.
   - Sincronizado com o schema TypeScript em `src/db/schema.ts`.

---

## 2. Estrutura do Esquema (Schema)

### Tabela `clientes`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id_cliente` | SERIAL PRIMARY KEY | Identificador único da empresa |
| `nome_empresa` | TEXT NOT NULL | Nome / Razão Social da empresa |
| `contato_ac` | TEXT NOT NULL | Pessoa de contato responsável (A/C) |
| `created_at` | TIMESTAMP | Data de cadastro |

### Tabela `unidades`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id_unidade` | SERIAL PRIMARY KEY | Identificador único da filial |
| `id_cliente` | INTEGER FK | Referência a `clientes.id_cliente` |
| `nome_unidade` | TEXT NOT NULL | Nome da cidade/filial (ex: Belém, Sumaré) |
| `created_at` | TIMESTAMP | Data de criação |

### Tabela `servicos_realizados`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id_servico` | SERIAL PRIMARY KEY | Identificador da ordem de serviço |
| `id_cliente` | INTEGER FK | Referência ao cliente |
| `id_unidade` | INTEGER FK (NULL) | Referência opcional à filial |
| `data_visita` | TEXT NOT NULL | Data no formato YYYY-MM-DD |
| `periodo` | TEXT NOT NULL | Período trabalhado (ex: 10:00 às 16:00) |
| `qtde_horas` | DOUBLE PRECISION | Horas apuradas para cálculo |
| `descricao_servicos` | TEXT NOT NULL | Descritivo detalhado das atividades |
| `created_at` | TIMESTAMP | Data de registro |

### Tabela `users`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | SERIAL PRIMARY KEY | ID sequencial |
| `uid` | TEXT UNIQUE | UID de autenticação (Supabase / Firebase) |
| `email` | TEXT NOT NULL | E-mail do usuário |
| `name` | TEXT | Nome completo |
| `role` | TEXT | Perfil (admin / operador / tecnico) |

---

## 3. Como executar no Supabase

1. Acesse o seu projeto no **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Abra a aba **SQL Editor** no menu lateral esquerdo.
3. Copie o conteúdo do arquivo `migrations/0000_supabase_migration.sql` e clique em **Run**.
4. Para popular os dados iniciais com as 10 empresas e os 30 serviços do sistema legado, execute também o script `sql/seed.sql`.
