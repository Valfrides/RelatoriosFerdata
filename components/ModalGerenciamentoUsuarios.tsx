'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  RefreshCw,
  Search,
  Database,
} from 'lucide-react';
import { Usuario } from '@/types';

interface ModalGerenciamentoUsuariosProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioAtual: Usuario;
  onNotificar?: (msg: string) => void;
}

export function ModalGerenciamentoUsuarios({
  isOpen,
  onClose,
  usuarioAtual,
  onNotificar,
}: ModalGerenciamentoUsuariosProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState('');
  const [abaInterna, setAbaInterna] = useState<'lista' | 'novo'>('lista');

  // Formulário de Novo Usuário
  const [novoUsername, setNovoUsername] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoPerfil, setNovoPerfil] = useState<'admin' | 'tecnico' | 'operador'>('tecnico');
  const [novaSenha, setNovaSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Redefinir Senha de um Usuário
  const [usuarioRedefinindo, setUsuarioRedefinindo] = useState<Usuario | null>(null);
  const [senhaRedefinida, setSenhaRedefinida] = useState('');
  const [salvandoRedefinicao, setSalvandoRedefinicao] = useState(false);

  // Confirmação de exclusão
  const [usuarioExcluindo, setUsuarioExcluindo] = useState<Usuario | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const carregarUsuarios = async () => {
    setCarregando(true);
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsuarios(data.users);
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarUsuarios();
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanUser = novoUsername.trim().toLowerCase();
    const cleanNome = novoNome.trim();
    const cleanPass = novaSenha.trim();

    if (!cleanUser || !cleanNome || !cleanPass) {
      setFeedback({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios (Login, Nome e Senha).' });
      return;
    }

    if (cleanUser.length < 3) {
      setFeedback({ tipo: 'erro', texto: 'O login de usuário deve ter no mínimo 3 caracteres.' });
      return;
    }

    if (cleanPass.length < 3) {
      setFeedback({ tipo: 'erro', texto: 'A senha inicial deve ter no mínimo 3 caracteres.' });
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-user',
          username: cleanUser,
          nome: cleanNome,
          email: novoEmail.trim(),
          perfil: novoPerfil,
          password: cleanPass,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ tipo: 'sucesso', texto: data.message || `Usuário "${cleanUser}" cadastrado com sucesso!` });
        if (onNotificar) {
          onNotificar(`Usuário ${cleanUser} cadastrado no Supabase.`);
        }
        // Limpa formulário
        setNovoUsername('');
        setNovoNome('');
        setNovoEmail('');
        setNovaSenha('');
        setNovoPerfil('tecnico');
        setAbaInterna('lista');
        carregarUsuarios();
      } else {
        setFeedback({ tipo: 'erro', texto: data.message || 'Erro ao cadastrar usuário.' });
      }
    } catch (err: any) {
      console.error('Erro ao cadastrar usuário:', err);
      setFeedback({ tipo: 'erro', texto: err.message || 'Falha de conexão com o servidor.' });
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarRedefinicaoSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioRedefinindo) return;
    setFeedback(null);

    const cleanPass = senhaRedefinida.trim();
    if (!cleanPass || cleanPass.length < 3) {
      setFeedback({ tipo: 'erro', texto: 'A nova senha deve ter no mínimo 3 caracteres.' });
      return;
    }

    setSalvandoRedefinicao(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin-reset-password',
          username: usuarioRedefinindo.username,
          newPassword: cleanPass,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          tipo: 'sucesso',
          texto: data.message || `Senha de ${usuarioRedefinindo.username} alterada com sucesso!`,
        });
        setUsuarioRedefinindo(null);
        setSenhaRedefinida('');
        carregarUsuarios();
      } else {
        setFeedback({ tipo: 'erro', texto: data.message || 'Erro ao redefinir senha.' });
      }
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Falha ao redefinir senha.' });
    } finally {
      setSalvandoRedefinicao(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!usuarioExcluindo) return;
    setFeedback(null);
    setExcluindo(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-user',
          username: usuarioExcluindo.username,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          tipo: 'sucesso',
          texto: data.message || `Usuário "${usuarioExcluindo.username}" excluído com sucesso.`,
        });
        setUsuarioExcluindo(null);
        carregarUsuarios();
      } else {
        setFeedback({ tipo: 'erro', texto: data.message || 'Erro ao excluir usuário.' });
      }
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Falha ao conectar com servidor.' });
    } finally {
      setExcluindo(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = busca.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.nome.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Controle de Usuários de Acesso
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  <Database className="w-3 h-3" />
                  Supabase
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cadastre novos usuários com permissões distintas, altere senhas ou exclua acessos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback visual */}
        {feedback && (
          <div
            className={`mx-5 sm:mx-6 mt-4 p-3 rounded-xl flex items-center justify-between text-xs font-medium border ${
              feedback.tipo === 'sucesso'
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-200'
                : 'bg-red-950/70 border-red-700/60 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.tipo === 'sucesso' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{feedback.texto}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="cursor-pointer font-bold opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Sub-menu de navegação interna */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAbaInterna('lista')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                abaInterna === 'lista'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Usuários Cadastrados ({usuarios.length})</span>
            </button>

            <button
              onClick={() => setAbaInterna('novo')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                abaInterna === 'novo'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Novo Usuário</span>
            </button>
          </div>

          {abaInterna === 'lista' && (
            <button
              onClick={carregarUsuarios}
              disabled={carregando}
              title="Atualizar lista do Supabase"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin text-purple-400' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          )}
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {abaInterna === 'novo' ? (
            /* Formulário de Cadastro de Novo Usuário */
            <form onSubmit={handleCadastrar} className="max-w-2xl mx-auto space-y-5 bg-slate-950/60 border border-slate-800 p-5 sm:p-7 rounded-2xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Cadastrar Novo Usuário no Supabase</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome Completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Login / Usuário <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={novoUsername}
                    onChange={(e) => setNovoUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Ex: joao.silva"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Será usado no momento do login (letras minúsculas).</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Perfil / Permissão <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={novoPerfil}
                    onChange={(e) => setNovoPerfil(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="operador">Operador (Visualização e Relatórios)</option>
                    <option value="tecnico">Técnico (Lançamentos e Ordens de Serviço)</option>
                    <option value="admin">Administrador (Controle Total + Usuários)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail (Opcional)
                  </label>
                  <input
                    type="email"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="Ex: joao@ferdata.com.br"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Senha Inicial de Acesso <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      required
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo de 3 caracteres"
                      className="w-full pl-3.5 pr-11 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAbaInterna('lista')}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  {salvando ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Salvando no Supabase...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Cadastrar Usuário</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Lista de Usuários */
            <div className="space-y-4">
              {/* Barra de Pesquisa */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquisar por login, nome ou e-mail..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              {carregando && usuarios.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Carregando usuários do Supabase...
                </div>
              ) : usuariosFiltrados.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 bg-slate-950/30 rounded-2xl border border-slate-800/80">
                  Nenhum usuário encontrado.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {usuariosFiltrados.map((u) => {
                    const eAdmin = u.perfil === 'admin' || u.username === 'admin';
                    const eTecnico = u.perfil === 'tecnico';
                    const eVoce = u.username.toLowerCase() === usuarioAtual.username.toLowerCase();

                    return (
                      <div
                        key={u.id || u.username}
                        className={`p-4 rounded-2xl border transition-all ${
                          eVoce
                            ? 'bg-purple-950/30 border-purple-800/80 shadow-md shadow-purple-950/50 ring-1 ring-purple-600/30'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                eAdmin
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : eTecnico
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {u.nome ? u.nome.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-white truncate">{u.nome || u.username}</span>
                                {eVoce && (
                                  <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded">
                                    Você
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                                <span className="font-mono text-slate-300">@{u.username}</span>
                                {u.email && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{u.email}</span>
                                  </>
                                )}
                              </div>

                              <div className="mt-2 flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                    eAdmin
                                      ? 'bg-amber-950/70 border-amber-600/50 text-amber-300'
                                      : eTecnico
                                      ? 'bg-blue-950/70 border-blue-600/50 text-blue-300'
                                      : 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300'
                                  }`}
                                >
                                  <Shield className="w-2.5 h-2.5" />
                                  {eAdmin ? 'Administrador' : eTecnico ? 'Técnico' : 'Operador'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Ações por usuário */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setUsuarioRedefinindo(u);
                                setSenhaRedefinida('');
                              }}
                              title="Redefinir senha de acesso deste usuário"
                              className="p-2 rounded-xl text-amber-400 hover:text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 transition cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {u.username !== 'admin' && !eVoce && (
                              <button
                                type="button"
                                onClick={() => setUsuarioExcluindo(u)}
                                title="Excluir usuário do sistema e do Supabase"
                                className="p-2 rounded-xl text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal interno para redefinir senha */}
        {usuarioRedefinindo && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-slate-900 border border-amber-600/60 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-amber-400">
                  <KeyRound className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-white">Redefinir Senha</h3>
                </div>
                <button
                  onClick={() => setUsuarioRedefinindo(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Digite a nova senha para o usuário <strong className="text-amber-300">@{usuarioRedefinindo.username}</strong> ({usuarioRedefinindo.nome}):
              </p>

              <form onSubmit={handleSalvarRedefinicaoSenha} className="space-y-4">
                <input
                  type="text"
                  required
                  autoFocus
                  value={senhaRedefinida}
                  onChange={(e) => setSenhaRedefinida(e.target.value)}
                  placeholder="Nova senha (mínimo 3 caracteres)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUsuarioRedefinindo(null)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvandoRedefinicao}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {salvandoRedefinicao ? 'Salvando...' : 'Salvar Nova Senha'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmação de exclusão */}
        {usuarioExcluindo && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-slate-900 border border-red-600/60 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-red-400 pb-2 border-b border-slate-800">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold text-white">Confirmar Exclusão de Usuário</h3>
              </div>

              <p className="text-xs text-slate-300">
                Tem certeza que deseja remover o usuário <strong className="text-red-300">@{usuarioExcluindo.username}</strong> ({usuarioExcluindo.nome})? O acesso será revogado imediatamente no sistema e no Supabase.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUsuarioExcluindo(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarExclusao}
                  disabled={excluindo}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {excluindo ? 'Excluindo...' : 'Sim, Excluir Usuário'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé informativo */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Todos os usuários e senhas são sincronizados em tempo real com o banco Supabase.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
