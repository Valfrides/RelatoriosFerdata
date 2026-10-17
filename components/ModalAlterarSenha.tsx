'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Usuario } from '@/types';

interface ModalAlterarSenhaProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioAtual: Usuario;
  onSenhaAlterada?: (mensagem: string) => void;
}

export function ModalAlterarSenha({
  isOpen,
  onClose,
  usuarioAtual,
  onSenhaAlterada,
}: ModalAlterarSenhaProps) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setErro('A nova senha e a confirmação não conferem.');
      return;
    }
    if (novaSenha.length < 3) {
      setErro('A nova senha deve ter no mínimo 3 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          username: usuarioAtual.username,
          currentPassword: senhaAtual,
          newPassword: novaSenha,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (onSenhaAlterada) {
          onSenhaAlterada('Senha alterada com sucesso!');
        }
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarNovaSenha('');
        onClose();
      } else {
        setErro(data.message || 'Erro ao alterar senha. Verifique a senha atual.');
      }
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      setErro('Falha de conexão com o servidor ao alterar senha.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Alterar Senha</h3>
              <p className="text-xs text-slate-400">
                Usuário atual: <span className="text-blue-400 font-semibold">{usuarioAtual.username}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {erro && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-700/60 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Senha Atual
            </label>
            <div className="relative">
              <input
                type={mostrarSenhas ? 'text' : 'password'}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Informe sua senha atual"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nova Senha
            </label>
            <input
              type={mostrarSenhas ? 'text' : 'password'}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite a nova senha (mínimo 3 caracteres)"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Confirmar Nova Senha
            </label>
            <input
              type={mostrarSenhas ? 'text' : 'password'}
              value={confirmarNovaSenha}
              onChange={(e) => setConfirmarNovaSenha(e.target.value)}
              placeholder="Digite a nova senha novamente"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setMostrarSenhas(!mostrarSenhas)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              {mostrarSenhas ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{mostrarSenhas ? 'Ocultar caracteres' : 'Exibir caracteres'}</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={carregando}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/30 disabled:opacity-60 cursor-pointer"
            >
              {carregando ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Atualizar Senha</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
