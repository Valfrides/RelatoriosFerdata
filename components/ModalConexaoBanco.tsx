'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface ModalConexaoBancoProps {
  isOpen: boolean;
  onClose: () => void;
  onDadosAtualizados?: () => void;
}

export function ModalConexaoBanco({
  isOpen,
  onClose,
  onDadosAtualizados,
}: ModalConexaoBancoProps) {
  const [carregando, setCarregando] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const testarConexao = async () => {
    setCarregando(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/supabase/test');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setStatus({
        success: false,
        error: err.message || 'Erro ao conectar ao servidor de teste',
      });
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      testarConexao();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSeedSupabase = async () => {
    setSeeding(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/supabase/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Dados iniciais populados com sucesso no Supabase!');
        testarConexao();
        if (onDadosAtualizados) onDadosAtualizados();
      } else {
        setFeedback(data.error || 'Falha ao popular dados no Supabase.');
      }
    } catch (err: any) {
      setFeedback(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setSeeding(false);
    }
  };

  const copiarMigration = () => {
    navigator.clipboard.writeText(`-- Execute migrations/0000_supabase_migration.sql no SQL Editor do Supabase`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-5 sm:p-6 space-y-5 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Topo */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Status do Banco de Dados &amp; Supabase</h3>
              <p className="text-xs text-slate-400">
                Diagnóstico de conexão, backend ativo e sincronização
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className="p-3 bg-blue-950/70 border border-blue-600/60 rounded-xl text-blue-200 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
          {/* Card do Backend Ativo */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                Backend Atualmente em Uso
              </span>
              <button
                onClick={testarConexao}
                disabled={carregando}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${carregando ? 'animate-spin' : ''}`} />
                <span>Atualizar Teste</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${
                  status?.configured && status?.connected
                    ? 'bg-emerald-400 shadow-md shadow-emerald-500/50 animate-pulse'
                    : status?.activeBackend === 'cloudsql'
                    ? 'bg-blue-400 shadow-md shadow-blue-500/50'
                    : 'bg-amber-400'
                }`}
              />
              <div>
                <p className="text-white font-bold text-sm">
                  {status?.configured && status?.connected
                    ? 'Supabase (PostgreSQL Remoto)'
                    : status?.activeBackend === 'cloudsql'
                    ? 'Google Cloud SQL (PostgreSQL Nativo)'
                    : 'Armazenamento Local Persistente'}
                </p>
                <p className="text-slate-400 text-[11px]">
                  {status?.configured && status?.connected
                    ? `Conectado com sucesso em ${status.latencyMs}ms (${status.url})`
                    : status?.activeBackend === 'cloudsql'
                    ? 'Instância Cloud SQL ativa na região us-east1'
                    : 'Armazenado em data/db.json com sincronização de disco'}
                </p>
              </div>
            </div>
          </div>

          {/* Seção Supabase */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-xs flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Conexão Supabase Direct SDK</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  status?.configured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {status?.configured ? 'Credenciais Presentes' : 'Aguardando Credenciais'}
              </span>
            </div>

            {status?.configured ? (
              <div className="space-y-3 pt-1">
                {status?.allTablesExist ? (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200">
                    <p className="font-semibold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Todas as tabelas do Supabase existem e estão prontas!</span>
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Clientes</span>
                        <strong className="text-white">{status.tables?.clientes?.count}</strong> registros
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Unidades</span>
                        <strong className="text-white">{status.tables?.unidades?.count}</strong> registros
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Serviços</span>
                        <strong className="text-white">{status.tables?.servicos_realizados?.count}</strong> registros
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-2">
                    <p className="font-semibold text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Tabelas ainda não encontradas no seu projeto Supabase</span>
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Acesse o <strong>SQL Editor</strong> do seu Supabase e execute o script{' '}
                      <code className="text-amber-300">migrations/0000_supabase_migration.sql</code>.
                    </p>
                  </div>
                )}

                {/* Botão de Seed para Supabase */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 text-[11px]">Deseja enviar a base de dados padrão para o Supabase?</span>
                  <button
                    onClick={handleSeedSupabase}
                    disabled={seeding || !status?.connected}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{seeding ? 'Enviando...' : 'Popular Dados no Supabase'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-slate-300 text-xs leading-relaxed pt-1">
                <p>
                  Para conectar o aplicativo diretamente ao seu banco no <strong>Supabase</strong>,
                  informe as seguintes variáveis no painel de ambiente do AI Studio (Secrets / Environment):
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-blue-300 space-y-1">
                  <p>NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co</p>
                  <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enquanto não forem preenchidas, o sistema utiliza com segurança a instância PostgreSQL nativa
                  (Cloud SQL) já provisionada para este projeto.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
          <span className="text-[11px] text-slate-500">
            Ferdata Informática • Migração PostgreSQL / Supabase
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
