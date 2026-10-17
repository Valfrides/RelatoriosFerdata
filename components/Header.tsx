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
  CheckCircle2,
  ShieldCheck,
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
  totalClientes,
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

  const perfilFormatado =
    usuarioAtual?.perfil === 'admin'
      ? 'Administrador'
      : usuarioAtual?.perfil === 'tecnico'
      ? 'Técnico'
      : 'Operador';

  return (
    <header className="border-b border-slate-800 bg-slate-950/98 backdrop-blur-md sticky top-0 z-40 shadow-xl shadow-black/30">
      {/* ======================================================== */}
      {/* LINHA 1: Identidade da Empresa + Status + Perfil + Ações */}
      {/* ======================================================== */}
      <div className="border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
          {/* Lado Esquerdo: Identidade Visual Ferdata Informática */}
          <div className="flex items-center gap-3 shrink-0">
            {customLogo ? (
              <img
                src={customLogo}
                alt="Ferdata Informática"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-md shadow-blue-600/30 bg-white/5 p-1 shrink-0 border border-blue-500/30"
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
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wide text-white whitespace-nowrap">
                  FERDATA INFORMÁTICA
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/90 border border-blue-700/60 px-2 py-0.5 rounded-full shrink-0">
                  Assistência Técnica
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="truncate">Gestão de Ordens &amp; Relatórios Técnicos</span>
                <span className="hidden md:inline text-slate-600">•</span>
                <span className="hidden md:inline text-slate-500">Osasco - SP</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Ações Rápidas, Banco, Logotipo, Usuário e Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto shrink-0 flex-wrap justify-end">
            {/* Botão Conexão Supabase / Banco */}
            {onAbrirConexaoBanco && (
              <button
                type="button"
                onClick={onAbrirConexaoBanco}
                title="Status da Conexão / Supabase e Cloud SQL"
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition cursor-pointer shadow-sm"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Banco &amp; Supabase</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </button>
            )}

            {/* Botão Personalizar Logotipo */}
            <button
              type="button"
              onClick={onAbrirUploadLogo}
              title="Personalizar logotipo do menu e dos relatórios em PDF"
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border transition cursor-pointer shadow-sm ${
                customLogo
                  ? 'bg-blue-950/80 border-blue-600/70 text-blue-300 hover:bg-blue-900/80'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Logotipo</span>
              {customLogo && (
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/30 text-blue-300 rounded font-bold border border-blue-400/40 hidden sm:inline">
                  Ativo
                </span>
              )}
            </button>

            {/* Divisor vertical */}
            <div className="h-5 w-px bg-slate-800 hidden sm:block mx-0.5" />

            {/* Card com dados do Usuário Logado */}
            {usuarioAtual && (
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-inner">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[11px] shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-bold text-white text-[11px] sm:text-xs truncate max-w-[90px] sm:max-w-[130px]">
                    {usuarioAtual.username}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {perfilFormatado}
                  </span>
                </div>
              </div>
            )}

            {/* Botão Alterar Senha */}
            {onAbrirAlterarSenha && (
              <button
                type="button"
                onClick={onAbrirAlterarSenha}
                title="Alterar Senha de Acesso"
                className="flex items-center gap-1 text-xs text-amber-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 px-2 sm:px-2.5 py-1.5 rounded-lg transition cursor-pointer shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden md:inline">Senha</span>
              </button>
            )}

            {/* Botão Sair */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Encerrar Sessão / Sair do Sistema"
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 px-2 sm:px-3 py-1.5 rounded-lg transition cursor-pointer shadow-sm font-semibold"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LINHA 2: Barra de Navegação Principal das Funções       */}
      {/* ======================================================== */}
      <div className="bg-slate-900/70 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          {/* Abas Principais em linha dedicada, espaçadas e com destaque visual */}
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm shrink-0">
            {/* 1. Menu de Relatórios */}
            <button
              type="button"
              onClick={() => setAbaAtiva('relatorios')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0 ${
                abaAtiva === 'relatorios'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 ring-1 ring-blue-400/50 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/90 border border-transparent'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Menu de Relatórios</span>
            </button>

            {/* 2. Cadastrar Serviços */}
            <button
              type="button"
              onClick={() => setAbaAtiva('cadastro')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0 ${
                abaAtiva === 'cadastro'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40 ring-1 ring-red-400/50 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/90 border border-transparent'
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Cadastrar Serviços</span>
            </button>

            {/* 3. Lançamentos */}
            <button
              type="button"
              onClick={() => setAbaAtiva('historico')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0 ${
                abaAtiva === 'historico'
                  ? 'bg-slate-700 text-white shadow-md ring-1 ring-slate-500/50 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/90 border border-transparent'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Lançamentos</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-950/80 text-blue-300 font-bold border border-slate-700/80">
                {totalServicos}
              </span>
            </button>

            {/* 4. Clientes & Unidades */}
            <button
              type="button"
              onClick={() => setAbaAtiva('clientes')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0 ${
                abaAtiva === 'clientes'
                  ? 'bg-slate-700 text-white shadow-md ring-1 ring-slate-500/50 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/90 border border-transparent'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Clientes &amp; Unidades</span>
              {typeof totalClientes === 'number' && totalClientes > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-950/80 text-emerald-300 font-bold border border-slate-700/80">
                  {totalClientes}
                </span>
              )}
            </button>

            {/* 5. Gerenciamento de Usuários (se administrador) */}
            {onAbrirGerenciamentoUsuarios && isAdmin && (
              <button
                type="button"
                onClick={onAbrirGerenciamentoUsuarios}
                title="Cadastrar novos usuários e gerenciar permissões no Supabase"
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0 text-purple-300 hover:text-white bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/70"
              >
                <Users className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Usuários</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-200 border border-purple-700/60 font-semibold">
                  Supabase
                </span>
              </button>
            )}
          </nav>

          {/* Lado Direito da Linha 2: Indicador de Sistema Ativo e Sincronizado */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/70 px-3.5 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-slate-300 font-medium">Supabase Conectado</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-[11px]">Banco em Nuvem Ativo</span>
          </div>
        </div>
      </div>
    </header>
  );
}
