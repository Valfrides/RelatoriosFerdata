'use client';

import React, { useState } from 'react';
import { Cliente, Unidade } from '@/types';
import {
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Edit2,
  Save,
  X,
} from 'lucide-react';

interface GerenciamentoClientesProps {
  clientes: Cliente[];
  unidades: Unidade[];
  onAtualizarDados: () => void;
}

export function GerenciamentoClientes({
  clientes,
  unidades,
  onAtualizarDados,
}: GerenciamentoClientesProps) {
  const [novoNomeEmpresa, setNovoNomeEmpresa] = useState('');
  const [novoContatoAC, setNovoContatoAC] = useState('');
  const [salvandoCliente, setSalvandoCliente] = useState(false);

  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<number | ''>('');
  const [novoNomeUnidade, setNovoNomeUnidade] = useState('');
  const [salvandoUnidade, setSalvandoUnidade] = useState(false);

  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [editNomeEmpresa, setEditNomeEmpresa] = useState('');
  const [editContatoAC, setEditContatoAC] = useState('');

  const [unidadeEditando, setUnidadeEditando] = useState<Unidade | null>(null);
  const [editNomeUnidade, setEditNomeUnidade] = useState('');

  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const iniciarEdicaoCliente = (cli: Cliente) => {
    setClienteEditando(cli);
    setEditNomeEmpresa(cli.nome_empresa);
    setEditContatoAC(cli.contato_ac);
  };

  const handleSalvarEdicaoCliente = async () => {
    if (!clienteEditando) return;
    if (!editNomeEmpresa.trim() || !editContatoAC.trim()) {
      setFeedback({ tipo: 'erro', texto: 'Nome da empresa e contato A/C não podem ficar vazios.' });
      return;
    }
    try {
      const res = await fetch('/api/clientes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: clienteEditando.id_cliente,
          nome_empresa: editNomeEmpresa.trim(),
          contato_ac: editContatoAC.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setFeedback({ tipo: 'sucesso', texto: `Cliente "${editNomeEmpresa}" atualizado com sucesso!` });
      setClienteEditando(null);
      onAtualizarDados();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      setFeedback({ tipo: 'erro', texto: msg });
    }
  };

  const handleExcluirCliente = async (cli: Cliente) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${cli.nome_empresa}" e todas as suas filiais vinculadas?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/clientes?id_cliente=${cli.id_cliente}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setFeedback({ tipo: 'sucesso', texto: `Cliente "${cli.nome_empresa}" excluído com sucesso.` });
      if (clienteEditando?.id_cliente === cli.id_cliente) {
        setClienteEditando(null);
      }
      onAtualizarDados();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir cliente';
      setFeedback({ tipo: 'erro', texto: msg });
    }
  };

  const iniciarEdicaoUnidade = (uni: Unidade) => {
    setUnidadeEditando(uni);
    setEditNomeUnidade(uni.nome_unidade);
  };

  const handleSalvarEdicaoUnidade = async () => {
    if (!unidadeEditando) return;
    if (!editNomeUnidade.trim()) {
      setFeedback({ tipo: 'erro', texto: 'O nome da unidade não pode ficar vazio.' });
      return;
    }
    try {
      const res = await fetch('/api/unidades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_unidade: unidadeEditando.id_unidade,
          nome_unidade: editNomeUnidade.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setFeedback({ tipo: 'sucesso', texto: `Unidade renomeada para "${editNomeUnidade}" com sucesso!` });
      setUnidadeEditando(null);
      onAtualizarDados();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar unidade';
      setFeedback({ tipo: 'erro', texto: msg });
    }
  };

  const handleExcluirUnidade = async (uni: Unidade) => {
    if (!confirm(`Deseja excluir a filial/unidade "${uni.nome_unidade}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/unidades?id_unidade=${uni.id_unidade}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setFeedback({ tipo: 'sucesso', texto: `Unidade "${uni.nome_unidade}" excluída com sucesso.` });
      if (unidadeEditando?.id_unidade === uni.id_unidade) {
        setUnidadeEditando(null);
      }
      onAtualizarDados();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir unidade';
      setFeedback({ tipo: 'erro', texto: msg });
    }
  };

  const handleCadastrarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNomeEmpresa.trim() || !novoContatoAC.trim()) {
      setFeedback({ tipo: 'erro', texto: 'Preencha o nome da empresa e o contato A/C.' });
      return;
    }
    setSalvandoCliente(true);
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_empresa: novoNomeEmpresa.trim(),
          contato_ac: novoContatoAC.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setNovoNomeEmpresa('');
      setNovoContatoAC('');
      setFeedback({ tipo: 'sucesso', texto: 'Novo cliente cadastrado com sucesso!' });
      onAtualizarDados();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar cliente';
      setFeedback({ tipo: 'erro', texto: msg });
    } finally {
      setSalvandoCliente(false);
    }
  };

  const handleCadastrarUnidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelecionadoId || !novoNomeUnidade.trim()) {
      setFeedback({ tipo: 'erro', texto: 'Selecione a empresa e informe o nome da unidade.' });
      return;
    }
    setSalvandoUnidade(true);
    try {
      const res = await fetch('/api/unidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: Number(clienteSelecionadoId),
          nome_unidade: novoNomeUnidade.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setNovoNomeUnidade('');
      setFeedback({ tipo: 'sucesso', texto: 'Nova unidade/filial cadastrada com sucesso!' });
      onAtualizarDados();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar unidade';
      setFeedback({ tipo: 'erro', texto: msg });
    } finally {
      setSalvandoUnidade(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-200 ${
            feedback.tipo === 'sucesso'
              ? 'bg-emerald-950/70 border-emerald-600/70 text-emerald-200'
              : 'bg-red-950/70 border-red-600/70 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white px-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {clienteEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-blue-500/40 rounded-2xl w-full max-w-lg p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Editar Cliente #{clienteEditando.id_cliente}</h3>
                  <p className="text-xs text-slate-400">Modifique o nome da empresa e a pessoa de contato</p>
                </div>
              </div>
              <button
                onClick={() => setClienteEditando(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  value={editNomeEmpresa}
                  onChange={(e) => setEditNomeEmpresa(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contato A/C (Responsável)</label>
                <input
                  type="text"
                  value={editContatoAC}
                  onChange={(e) => setEditContatoAC(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleExcluirCliente(clienteEditando)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Cliente</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setClienteEditando(null)}
                  className="px-3 py-2 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvarEdicaoCliente}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {unidadeEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-md p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Editar Unidade / Filial</h3>
                  <p className="text-xs text-slate-400">Renomeie ou altere o nome da filial</p>
                </div>
              </div>
              <button
                onClick={() => setUnidadeEditando(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Unidade / Filial</label>
                <input
                  type="text"
                  value={editNomeUnidade}
                  onChange={(e) => setEditNomeUnidade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleExcluirUnidade(unidadeEditando)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Unidade</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUnidadeEditando(null)}
                  className="px-3 py-2 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvarEdicaoUnidade}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Nome</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Novo Cliente</h3>
              <p className="text-xs text-slate-400">Cadastre uma nova empresa e pessoa de contato A/C</p>
            </div>
          </div>
          <form onSubmit={handleCadastrarCliente} className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Nome da Empresa</label>
              <input
                type="text"
                placeholder="Ex: Exfak, Favorita, Nova Empresa"
                value={novoNomeEmpresa}
                onChange={(e) => setNovoNomeEmpresa(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Contato A/C</label>
              <input
                type="text"
                placeholder="Ex: Sr. Sergio, Sra. Maria"
                value={novoContatoAC}
                onChange={(e) => setNovoContatoAC(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={salvandoCliente}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{salvandoCliente ? 'Cadastrando...' : 'Cadastrar Empresa'}</span>
            </button>
          </form>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Nova Unidade / Filial</h3>
              <p className="text-xs text-slate-400">Vincule uma nova filial a um cliente existente</p>
            </div>
          </div>
          <form onSubmit={handleCadastrarUnidade} className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Empresa Pertencente</label>
              <select
                value={clienteSelecionadoId}
                onChange={(e) =>
                  setClienteSelecionadoId(e.target.value ? Number(e.target.value) : '')
                }
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Selecione a empresa...</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nome_empresa}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Nome da Unidade / Filial</label>
              <input
                type="text"
                placeholder="Ex: Rio de Janeiro, Campinas, Matriz"
                value={novoNomeUnidade}
                onChange={(e) => setNovoNomeUnidade(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              disabled={salvandoUnidade}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{salvandoUnidade ? 'Cadastrando...' : 'Cadastrar Unidade'}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-bold text-white text-base">Clientes e Unidades Registrados</h3>
            <p className="text-xs text-slate-400">
              Clique em &quot;Editar&quot; em qualquer cliente ou unidade para modificar os dados cadastrados
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            {clientes.length} empresas • {unidades.length} filiais
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {clientes.map((c) => {
            const filiaisDeste = unidades.filter((u) => u.id_cliente === c.id_cliente);
            return (
              <div
                key={c.id_cliente}
                className="group relative p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate">
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-blue-300 transition">
                        {c.nome_empresa}
                      </h4>
                      <span className="text-xs text-slate-400 block truncate">
                        A/C: <strong className="text-slate-200">{c.contato_ac || '—'}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => iniciarEdicaoCliente(c)}
                      className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg transition shrink-0 cursor-pointer"
                      title="Editar dados da empresa ou contato"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 mt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        Unidades ({filiaisDeste.length}):
                      </span>
                    </div>
                    {filiaisDeste.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {filiaisDeste.map((u) => (
                          <div
                            key={u.id_unidade}
                            className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 bg-slate-900 text-slate-200 rounded-md border border-slate-800 hover:border-purple-500/60 transition group/uni"
                          >
                            <span>{u.nome_unidade}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                iniciarEdicaoUnidade(u);
                              }}
                              className="text-slate-400 hover:text-purple-300 p-0.5 cursor-pointer"
                              title="Editar nome da unidade"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExcluirUnidade(u);
                              }}
                              className="text-slate-400 hover:text-red-400 p-0.5 cursor-pointer"
                              title="Excluir unidade"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic block">
                        Cliente com sede única (sem filiais)
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900">
                  <span>ID #{c.id_cliente}</span>
                  <button
                    onClick={() => iniciarEdicaoCliente(c)}
                    className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Editar Cliente</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
