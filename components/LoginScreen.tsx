'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { Usuario } from '@/types';

interface LoginScreenProps {
  onLoginSucesso: (user: Usuario, lembrar: boolean) => void;
  customLogo?: string | null;
}

export function LoginScreen({ onLoginSucesso, customLogo }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErro('Por favor, informe o usuário e a senha.');
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: cleanUser,
          password: cleanPass,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onLoginSucesso(data.user, lembrar);
      } else {
        setErro(data.message || 'Usuário ou senha incorretos.');
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      setErro('Erro de conexão ao servidor de autenticação. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden select-none">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <div className="text-center space-y-3 pb-6 border-b border-slate-800/80">
          <div className="flex justify-center">
            {customLogo ? (
              <img
                src={customLogo}
                alt="Ferdata Informática"
                className="w-16 h-16 rounded-2xl object-contain shadow-lg shadow-blue-500/20 bg-white/5 p-1 border border-blue-500/30"
              />
            ) : (
              <div className="relative">
                <Image
                  src="/logo_ferdata.svg"
                  alt="Ferdata Informática"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-2xl object-contain shadow-lg shadow-blue-500/20"
                  priority
                />
              </div>
            )}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acesso Restrito à Ferdata Informática</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Entrar no Sistema
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Gestão de Ordens de Serviço &amp; Emissão de Relatórios
            </p>
          </div>
        </div>

        {erro && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/80 border border-red-700/60 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Usuário / Login
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                autoComplete="username"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Senha de Acesso
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
              <span>Manter conectado</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {carregando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verificando credenciais...</span>
              </>
            ) : (
              <>
                <span>Acessar o Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              Autenticação de usuários integrada ao <strong>Supabase</strong>
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            Ferdata Informática – Assistência Técnica Especializada – Osasco / SP
          </p>
        </div>
      </div>
    </div>
  );
}
