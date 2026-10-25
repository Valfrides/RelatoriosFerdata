'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Cliente, Unidade, ServicoRealizadoCompleto } from '@/types';
import {
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Building,
  RotateCcw,
  Search,
  ListPlus,
  Trash2,
  Edit2,
} from 'lucide-react';

interface CadastroServicosProps {
  clientes: Cliente[];
  unidades: Unidade[];
  onServicoCriado: () => void;
  servicosExistentes: ServicoRealizadoCompleto[];
  servicoParaEdicao?: ServicoRealizadoCompleto | null;
  onLimparEdicao?: () => void;
  customLogo?: string | null;
}

export function CadastroServicos({
  clientes,
  unidades,
  onServicoCriado,
  servicosExistentes,
  servicoParaEdicao,
  onLimparEdicao,
  customLogo,
}: CadastroServicosProps) {
  const [idCliente, setIdCliente] = useState<number | ''>('');
  const [idUnidade, setIdUnidade] = useState<number | ''>('');
  const [dataVisita, setDataVisita] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [qtdeHoras, setQtdeHoras] = useState<number | ''>('');
  const [descricaoServicos, setDescricaoServicos] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(null);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const dataVisitaRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (servicoParaEdicao) {
      setIdEditando(servicoParaEdicao.id_servico);
      setIdCliente(servicoParaEdicao.id_cliente);
      setIdUnidade(servicoParaEdicao.id_unidade || '');
      setDataVisita(servicoParaEdicao.data_visita);
      setPeriodo(servicoParaEdicao.periodo);
      setQtdeHoras(servicoParaEdicao.qtde_horas);
      setDescricaoServicos(servicoParaEdicao.descricao_servicos);
      setFeedback({
        tipo: 'sucesso',
        mensagem: `Registro #${servicoParaEdicao.id_servico} carregado para edição.`,
      });
    } else {
      setIdEditando(null);
      setIdCliente('');
      setIdUnidade('');
      setDataVisita('');
      setPeriodo('');
      setQtdeHoras('');
      setDescricaoServicos('');
    }
  }, [servicoParaEdicao]);

  const unidadesDoCliente = idCliente
    ? unidades.filter((u) => u.id_cliente === Number(idCliente))
    : [];

  const clienteAtual = clientes.find((c) => c.id_cliente === Number(idCliente));

  const limparFormulario = () => {
    setIdEditando(null);
    setIdCliente('');
    setIdUnidade('');
    setDataVisita('');
    setPeriodo('');
    setQtdeHoras('');
    setDescricaoServicos('');
    setFeedback(null);
    if (onLimparEdicao) onLimparEdicao();
  };

  const carregarRegistroParaEdicao = (servico: ServicoRealizadoCompleto) => {
    setIdEditando(servico.id_servico);
    setIdCliente(servico.id_cliente);
    setIdUnidade(servico.id_unidade || '');
    setDataVisita(servico.data_visita);
    setPeriodo(servico.periodo);
    setQtdeHoras(servico.qtde_horas);
    setDescricaoServicos(servico.descricao_servicos);
    setFeedback({
      tipo: 'sucesso',
      mensagem: `Carregado registro #${servico.id_servico} para edição. Faça as alterações e salve.`,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSalvar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!idCliente) {
      setFeedback({ tipo: 'erro', mensagem: 'Selecione o Cliente antes de salvar.' });
      return;
    }
    if (!dataVisita) {
      setFeedback({ tipo: 'erro', mensagem: 'Informe a Data da Visita.' });
      return;
    }
    if (!periodo.trim()) {
      setFeedback({ tipo: 'erro', mensagem: 'Informe o Período de execução.' });
      return;
    }
    if (!descricaoServicos.trim()) {
      setFeedback({ tipo: 'erro', mensagem: 'Preencha a descrição dos Serviços Realizados.' });
      return;
    }

    setSalvando(true);
    setFeedback(null);

    try {
      const payload = {
        id_cliente: Number(idCliente),
        id_unidade: idUnidade ? Number(idUnidade) : null,
        data_visita: dataVisita,
        periodo: periodo.trim(),
        qtde_horas: qtdeHoras === '' ? 0 : Number(qtdeHoras),
        descricao_servicos: descricaoServicos.trim(),
      };

      const url = idEditando ? `/api/servicos/${idEditando}` : '/api/servicos';
      const method = idEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Erro ao gravar serviço.');
      }

      setFeedback({
        tipo: 'sucesso',
        mensagem: idEditando
          ? `Serviço #${idEditando} atualizado com sucesso!`
          : 'Serviço técnico gravado com sucesso! Formulário pronto para novo lançamento.',
      });

      onServicoCriado();

      if (!idEditando) {
        limparFormulario();
      } else {
        setIdEditando(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na comunicação com o servidor';
      setFeedback({ tipo: 'erro', mensagem: msg });
    } finally {
      setSalvando(false);
    }
  };

  const inserirMarcador = () => {
    setDescricaoServicos((prev) => {
      if (prev.endsWith('\n') || prev === '') {
        return prev + '- ';
      }
      return prev + '\n- ';
    });
  };

  const predefinirPeriodo = (texto: string, horas: number) => {
    setPeriodo(texto);
    setQtdeHoras(horas);
  };

  const definirDataHoje = () => {
    setDataVisita(new Date().toISOString().split('T')[0]);
  };

  const definirDataOntem = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDataVisita(d.toISOString().split('T')[0]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSalvar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const registrosFiltrados = servicosExistentes.filter((s) => {
    if (!termoPesquisa) return true;
    const termo = termoPesquisa.toLowerCase();
    return (
      (s.nome_empresa && s.nome_empresa.toLowerCase().includes(termo)) ||
      (s.nome_unidade && s.nome_unidade.toLowerCase().includes(termo)) ||
      (s.descricao_servicos && s.descricao_servicos.toLowerCase().includes(termo)) ||
      s.data_visita.includes(termo)
    );
  });

  const totalRegistros = servicosExistentes.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {customLogo ? (
              <img
                src={customLogo}
                alt="Ferdata Informática"
                className="w-10 h-10 rounded-xl object-contain shadow-md shadow-blue-600/30 bg-white/5 p-0.5"
              />
            ) : (
              <Image
                src="/logo_ferdata.svg"
                alt="Ferdata Informática"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-contain shadow-md shadow-blue-600/30"
              />
            )}
            <div>
              <h1 className="text-xl font-black tracking-wide text-white uppercase">
                Cadastro de Serviços Técnicos
              </h1>
              <p className="text-xs text-slate-400">
                {idEditando ? `Editando Registro #${idEditando}` : 'Novo lançamento de visita técnica e laboratório'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {idEditando && (
              <button
                type="button"
                onClick={limparFormulario}
                className="px-3 py-1.5 text-xs text-amber-300 bg-amber-950/60 border border-amber-800/80 rounded-lg hover:bg-amber-900/60 transition cursor-pointer"
              >
                Cancelar Edição
              </button>
            )}
            <button
              type="button"
              onClick={limparFormulario}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Campos</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`mx-6 mt-5 p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-200 ${
              feedback.tipo === 'sucesso'
                ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-200'
                : 'bg-red-950/60 border-red-700/70 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.tipo === 'sucesso' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="font-medium">{feedback.mensagem}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSalvar} className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                <span>Cliente</span>
                <span className="text-red-400">*</span>
              </label>
              {clienteAtual && (
                <span className="text-xs text-slate-400 italic">
                  Contato A/C: <strong className="text-slate-200">{clienteAtual.contato_ac || '—'}</strong>
                </span>
              )}
            </div>
            <select
              value={idCliente}
              onChange={(e) => setIdCliente(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">Selecione o Cliente...</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nome_empresa} {c.contato_ac ? `(A/C: ${c.contato_ac})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  onClick={() => {
                    try {
                      dataVisitaRef.current?.showPicker?.();
                    } catch {}
                    dataVisitaRef.current?.focus();
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 cursor-pointer hover:text-white transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Data da Visita</span>
                  <span className="text-red-400">*</span>
                </label>
              </div>
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  try {
                    dataVisitaRef.current?.showPicker?.();
                  } catch {}
                  dataVisitaRef.current?.focus();
                }}
              >
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  ref={dataVisitaRef}
                  type="date"
                  value={dataVisita}
                  onChange={(e) => setDataVisita(e.target.value)}
                  onClick={(e) => {
                    try {
                      (e.target as HTMLInputElement).showPicker?.();
                    } catch {}
                  }}
                  required
                  style={{ colorScheme: 'dark' }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <div className="flex gap-1.5 mt-1 text-[11px] text-slate-400">
                <button type="button" onClick={definirDataHoje} className="hover:text-blue-400 underline cursor-pointer">
                  Hoje
                </button>
                <span>•</span>
                <button type="button" onClick={definirDataOntem} className="hover:text-blue-400 underline cursor-pointer">
                  Ontem
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Período</span>
                  <span className="text-red-400">*</span>
                </label>
              </div>
              <input
                type="text"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                placeholder="Ex: 10:00 às 16:00 Horas"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-slate-400">
                <button
                  type="button"
                  onClick={() => predefinirPeriodo('08:30 às 17:00 Horas', 8.5)}
                  className="hover:text-blue-300 underline cursor-pointer"
                >
                  Comercial
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => predefinirPeriodo('02 Horas de laboratório', 2.0)}
                  className="hover:text-blue-300 underline cursor-pointer"
                >
                  2h Lab
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => predefinirPeriodo('01 Hora suporte remoto', 1.0)}
                  className="hover:text-blue-300 underline cursor-pointer"
                >
                  Remoto
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span>Qtde. Horas</span>
                </label>
              </div>
              <input
                type="number"
                step="0.25"
                min="0"
                value={qtdeHoras}
                onChange={(e) => setQtdeHoras(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Ex: 2, 4.5, 8.25</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span>Unidade</span>
                </label>
                {unidadesDoCliente.length === 0 && (
                  <span className="text-[10px] text-slate-500">Sem filiais</span>
                )}
              </div>
              <select
                value={idUnidade}
                onChange={(e) => setIdUnidade(e.target.value ? Number(e.target.value) : '')}
                disabled={unidadesDoCliente.length === 0}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-900"
              >
                <option value="">
                  {unidadesDoCliente.length > 0 ? 'Selecione a Filial...' : 'Não aplicável'}
                </option>
                {unidadesDoCliente.map((u) => (
                  <option key={u.id_unidade} value={u.id_unidade}>
                    {u.nome_unidade}
                  </option>
                ))}
              </select>
              {unidadesDoCliente.length > 0 && (
                <span className="text-[11px] text-blue-400 block mt-1">
                  {unidadesDoCliente.length} filiais cadastradas
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>Serviços Realizados</span>
                <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={inserirMarcador}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded transition cursor-pointer"
                >
                  <ListPlus className="w-3 h-3" />
                  <span>Inserir Tópico (- )</span>
                </button>
              </div>
            </div>
            <div>
              <textarea
                rows={6}
                value={descricaoServicos}
                onChange={(e) => setDescricaoServicos(e.target.value)}
                placeholder="- Detalhe os serviços técnicos executados...&#10;- Instalação de sistema operacional e softwares...&#10;- Passagem e crimpagem de cabeamento de rede..."
                required
                className="w-full p-3 sm:p-4 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              <p className="text-[11px] text-slate-500 order-2 sm:order-1">
                Dica: Use quebras de linha e hífens para criar marcadores. Atalho: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">Ctrl+S</kbd>
              </p>
              <div className="flex items-center justify-end gap-2 order-1 sm:order-2 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={salvando}
                  title="Salvar Registro (Atalho: Ctrl+S)"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-600/30 active:scale-95 transition-all border border-blue-400/30 min-h-[44px] cursor-pointer"
                >
                  <Save className="w-5 h-5 text-white shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {salvando ? 'Gravando...' : idEditando ? 'Atualizar Registro' : 'Salvar Registro'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Registro:</span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200">
              {idEditando ? `#${idEditando}` : `${totalRegistros} total`}
            </span>
            <span className="text-slate-500">de {totalRegistros}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Pesquisar registros anteriores..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Últimos Serviços Cadastrados</h3>
            <p className="text-xs text-slate-400">
              Exibindo registros armazenados no banco de dados com possibilidade de edição direta
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
            {registrosFiltrados.length} localizados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Unidade</th>
                <th className="py-2.5 px-3">Período</th>
                <th className="py-2.5 px-3">Horas</th>
                <th className="py-2.5 px-3">Serviços Executados</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {registrosFiltrados.slice(0, 8).map((servico) => (
                <tr key={servico.id_servico} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-mono text-blue-400 whitespace-nowrap">
                    {servico.data_visita}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                    {servico.nome_empresa}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                    {servico.nome_unidade || '—'}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-300">
                    {servico.periodo}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                    {servico.qtde_horas}h
                  </td>
                  <td className="py-2.5 px-3 max-w-xs truncate text-slate-400" title={servico.descricao_servicos}>
                    {servico.descricao_servicos}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => carregarRegistroParaEdicao(servico)}
                      className="p-1 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded transition mr-1 cursor-pointer"
                      title="Editar registro"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Deseja realmente excluir o serviço #${servico.id_servico}?`)) {
                          await fetch(`/api/servicos/${servico.id_servico}`, { method: 'DELETE' });
                          onServicoCriado();
                        }
                      }}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded transition cursor-pointer"
                      title="Excluir registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
