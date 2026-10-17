'use client';

import React from 'react';
import Image from 'next/image';
import {
  FileText,
  PlusCircle,
  Clock,
  Building2,
  ImageIcon,
  LogOut,
  KeyRound,
  User,
  Database,
  Users,
} from 'lucide-react';
import { Usuario } from '@/types';

interface HeaderProps {
  abaAtiva: 'relatorios' | 'cadastro' | 'historico' | 'clientes';
  setAbaAtiva: (aba: 'relatorios' | 'cadastro' | 'historico' | 'clientes') => void;
  totalServicos: number;
  totalClientes?: number;
  customLogo?: string | null;
  onAbrirUploadLogo: () => void;
  usuarioAtual?: Usuario | null;
  onAbrirAlterarSenha?: () => void;
  onLogout?: () => void;
  onAbrirConexaoBanco?: () => void;
  onAbrirGerenciamentoUsuarios?: () => void;
}

export function Header({
  abaAtiva,
  setAbaAtiva,
  totalServicos,
  customLogo,
  onAbrirUploadLogo,
  usuarioAtual,
  onAbrirAlterarSenha,
  onLogout,
  onAbrirConexaoBanco,
  onAbrirGerenciamentoUsuarios,
}: HeaderProps) {
  const isAdmin =
    !usuarioAtual ||
    usuarioAtual?.perfil === 'admin' ||
    usuarioAtual?.username?.toLowerCase() === 'admin' ||
    usuarioAtual?.username?.toLowerCase() === 'administrador';

  return (
    <header className="border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between py-2.5 xl:h-16 gap-2.5 xl:gap-4">
          {/* Identidade Visual */}
          <div className="flex items-center justify-between gap-3 w-full xl:w-auto shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {customLogo ? (
                <img
                  src={customLogo}
                  alt="Ferdata Informática"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-md shadow-blue-600/30 bg-white/5 p-0.5 shrink-0 border border-blue-500/20"
                />
              ) : (
                <Image
                  src="/logo_ferdata.svg"
                  alt="Ferdata Informática"
                  width={40}
                  height={40}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-md shadow-blue-600/30 shrink-0"
                  priority
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-wide text-white whitespace-nowrap">
                    FERDATA INFORMÁTICA
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/90 border border-blue-700/60 px-1.5 sm:px-2 py-0.5 rounded shrink-0">
                    Assistência Técnica
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden xs:block">
                  Gestão de Ordens &amp; Relatórios Técnicos
                </p>
              </div>
            </div>

            {/* Ações em telas pequenas */}
            <div className="flex xl:hidden items-center gap-1 sm:gap-1.5 shrink-0">
              {onAbrirGerenciamentoUsuarios && isAdmin && (
                <button
                  type="button"
                  onClick={onAbrirGerenciamentoUsuarios}
                  title="Gerenciar Usuários"
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg border border-purple-800/60 bg-purple-950/40 text-purple-300 hover:text-white transition cursor-pointer shrink-0"
                >
                  <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="hidden sm:inline">Usuários</span>
                </button>
              )}

              {onAbrirConexaoBanco && (
                <button
                  type="button"
                  onClick={onAbrirConexaoBanco}
                  title="Status da Conexão / Supabase"
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition cursor-pointer shrink-0"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">Banco</span>
                </button>
              )}

              <button
                type="button"
                onClick={onAbrirUploadLogo}
                title="Personalizar logotipo"
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                  customLogo
                    ? 'bg-blue-950/80 border-blue-600/70 text-blue-300 hover:bg-blue-900/80'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="hidden sm:inline">Logo</span>
                {customLogo && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              {onAbrirAlterarSenha && (
                <button
                  type="button"
                  onClick={onAbrirAlterarSenha}
                  title="Alterar Senha de Acesso"
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1.5 rounded-lg transition cursor-pointer shrink-0"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Senha</span>
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Encerrar Sessão / Sair"
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/40 border border-red-800/50 px-2 py-1.5 rounded-lg transition cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              )}
            </div>
          </div>

          {/* Barra de Navegação Principal */}
          <div className="w-full xl:w-auto flex items-center justify-start sm:justify-center xl:justify-center overflow-x-auto pb-0.5 xl:pb-0 scrollbar-none">
            <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 p-1 sm:p-1.5 rounded-xl border border-slate-800/80 text-xs sm:text-sm w-full sm:w-auto justify-between sm:justify-start shrink-0">
              <button
                type="button"
                onClick={() => setAbaAtiva('relatorios')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  abaAtiva === 'relatorios'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 ring-1 ring-blue-400/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Menu de Relatórios</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva('cadastro')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  abaAtiva === 'cadastro'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/40 ring-1 ring-red-400/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Cadastrar Serviços</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva('historico')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  abaAtiva === 'historico'
                    ? 'bg-slate-700 text-white shadow-md ring-1 ring-slate-500/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>Lançamentos</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-950/70 text-slate-200 font-bold border border-slate-700/60">
                  {totalServicos}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva('clientes')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  abaAtiva === 'clientes'
                    ? 'bg-slate-700 text-white shadow-md ring-1 ring-slate-500/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Clientes &amp; Unidades</span>
              </button>

              {onAbrirGerenciamentoUsuarios && isAdmin && (
                <button
                  type="button"
                  onClick={onAbrirGerenciamentoUsuarios}
                  title="Cadastrar e gerenciar usuários de acesso (Supabase)"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 text-purple-300 hover:text-white bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/60"
                >
                  <Users className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Usuários</span>
                </button>
              )}
            </nav>
          </div>

          {/* Desktop xl+: Ações Rápidas */}
          <div className="hidden xl:flex items-center gap-2.5 shrink-0">
            {onAbrirGerenciamentoUsuarios && isAdmin && (
              <button
                type="button"
                onClick={onAbrirGerenciamentoUsuarios}
                title="Cadastrar e gerenciar usuários de acesso (Supabase)"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-800/60 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 hover:text-white transition cursor-pointer shrink-0"
              >
                <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Usuários</span>
              </button>
            )}

            {onAbrirConexaoBanco && (
              <button
                type="button"
                onClick={onAbrirConexaoBanco}
                title="Status da Conexão / Supabase"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition cursor-pointer shrink-0"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Banco &amp; Supabase</span>
              </button>
            )}

            <button
              type="button"
              onClick={onAbrirUploadLogo}
              title="Personalizar imagem do logotipo para o menu e relatórios em PDF"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                customLogo
                  ? 'bg-blue-950/80 border-blue-600/70 text-blue-300 hover:bg-blue-900/80'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Logotipo</span>
              {customLogo && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {usuarioAtual && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[11px]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-bold text-white text-[11px] truncate max-w-[100px]">
                    {usuarioAtual.username}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {usuarioAtual.perfil === 'admin' ? 'Administrador' : usuarioAtual.perfil === 'tecnico' ? 'Técnico' : 'Operador'}
                  </span>
                </div>
              </div>
            )}

            {onAbrirAlterarSenha && (
              <button
                type="button"
                onClick={onAbrirAlterarSenha}
                title="Alterar Senha de Acesso"
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Alterar Senha</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Encerrar Sessão / Sair do Sistema"
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/40 border border-red-800/50 px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
