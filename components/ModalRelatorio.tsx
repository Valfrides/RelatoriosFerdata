'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Calendar, Download, Eye, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Cliente, Unidade, ServicoRealizadoCompleto, DadosPreviaRelatorio } from '@/types';
import { gerarRelatorioServicosPDF } from '@/lib/pdf-generator';

interface ModalRelatorioProps {
  cliente: Cliente | null;
  unidade?: Unidade | null;
  todasUnidadesCliente: Unidade[];
  isOpen: boolean;
  onClose: () => void;
  onVisualizarRelatorio: (dados: DadosPreviaRelatorio) => void;
  onVisualizarPdf?: (pdfDataUri: string, titulo: string) => void;
  customLogo?: string | null;
}

export function ModalRelatorio({
  cliente,
  unidade,
  todasUnidadesCliente,
  isOpen,
  onClose,
  onVisualizarRelatorio,
  onVisualizarPdf,
  customLogo,
}: ModalRelatorioProps) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [unidadeSelecionadaId, setUnidadeSelecionadaId] = useState<number | null>(
    unidade ? unidade.id_unidade : null
  );
  const [carregando, setCarregando] = useState(false);
  const [servicosFiltrados, setServicosFiltrados] = useState<ServicoRealizadoCompleto[]>([]);
  const [totalHoras, setTotalHoras] = useState(0);

  const dataInicioRef = React.useRef<HTMLInputElement>(null);
  const dataFimRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDataInicio('');
      setDataFim('');
      if (unidade) {
        setUnidadeSelecionadaId(unidade.id_unidade);
      } else {
        setUnidadeSelecionadaId(null);
      }
    }
  }, [isOpen, unidade]);

  useEffect(() => {
    if (!cliente || !isOpen) return;
    async function buscarRegistros() {
      setCarregando(true);
      try {
        const params = new URLSearchParams();
        params.append('id_cliente', cliente!.id_cliente.toString());
        if (unidadeSelecionadaId) {
          params.append('id_unidade', unidadeSelecionadaId.toString());
        }
        if (dataInicio) {
          params.append('data_inicio', dataInicio);
        }
        if (dataFim) {
          params.append('data_fim', dataFim);
        }
        const res = await fetch(`/api/servicos?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setServicosFiltrados(data.data);
          const horas = (data.data as ServicoRealizadoCompleto[]).reduce(
            (acc, s) => acc + (Number(s.qtde_horas) || 0),
            0
          );
          setTotalHoras(horas);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do relatório:', err);
      } finally {
        setCarregando(false);
      }
    }
    buscarRegistros();
  }, [cliente, unidadeSelecionadaId, dataInicio, dataFim, isOpen]);

  if (!isOpen || !cliente) return null;

  const unidadeAtual = todasUnidadesCliente.find((u) => u.id_unidade === unidadeSelecionadaId);

  const obterInstanciaPdf = () => {
    return gerarRelatorioServicosPDF({
      clienteNome: cliente.nome_empresa,
      contatoAC: cliente.contato_ac,
      unidadeNome: unidadeAtual?.nome_unidade,
      servicos: servicosFiltrados,
      dataInicio,
      dataFim,
      dataEmissao: new Date(),
      customLogo,
    });
  };

  const handleBaixarPdf = () => {
    const doc = obterInstanciaPdf();
    const nomeLimpo = cliente.nome_empresa.replace(/[^a-zA-Z0-9]/g, '_');
    const unidadeSlug = unidadeAtual ? `_${unidadeAtual.nome_unidade}` : '';
    const periodoSufixo = dataInicio && dataFim ? `_${dataInicio}_a_${dataFim}` : '_Geral';
    const nomeArquivo = `Relatorio_${nomeLimpo}${unidadeSlug}${periodoSufixo}.pdf`;
    doc.save(nomeArquivo);
  };

  const handleVisualizarPdf = () => {
    const doc = obterInstanciaPdf();
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const titulo = `Relatório - ${cliente.nome_empresa} ${unidadeAtual ? `(${unidadeAtual.nome_unidade})` : ''}`;

    if (onVisualizarRelatorio) {
      onVisualizarRelatorio({
        tipo: 'geral',
        titulo,
        clienteNome: cliente.nome_empresa,
        contatoAC: cliente.contato_ac,
        unidadeNome: unidadeAtual?.nome_unidade,
        dataInicio,
        dataFim,
        servicos: servicosFiltrados,
        customLogo,
        pdfDataUri: blobUrl,
        onBaixarPdf: handleBaixarPdf,
      });
    } else if (onVisualizarPdf) {
      onVisualizarPdf(blobUrl, titulo);
    }
  };

  const definirPeriodo = (inicio: string, fim: string) => {
    setDataInicio(inicio);
    setDataFim(fim);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {customLogo ? (
              <img
                src={customLogo}
                alt="Ferdata"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain shadow-md shadow-blue-600/20 bg-white/5 p-0.5 shrink-0"
              />
            ) : (
              <Image
                src="/logo_ferdata.svg"
                alt="Ferdata"
                width={36}
                height={36}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain shadow-md shadow-blue-600/20 shrink-0"
              />
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Emissão de Relatório Técnico
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Selecione o intervalo de datas para compilar a ordem de serviço
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

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Cliente</span>
              <span className="font-semibold text-white text-base">{cliente.nome_empresa}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">A/C (Contato)</span>
              <span className="font-medium text-slate-200">{cliente.contato_ac || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Unidade</span>
              {todasUnidadesCliente.length > 0 ? (
                <select
                  value={unidadeSelecionadaId || ''}
                  onChange={(e) =>
                    setUnidadeSelecionadaId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="mt-0.5 text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                >
                  <option value="">Todas as Unidades</option>
                  {todasUnidadesCliente.map((u) => (
                    <option key={u.id_unidade} value={u.id_unidade}>
                      {u.nome_unidade}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-slate-400 italic">Matriz / Única</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Período de Emissão
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  onClick={() => {
                    try {
                      dataInicioRef.current?.showPicker?.();
                    } catch {}
                    dataInicioRef.current?.focus();
                  }}
                  className="block text-xs text-slate-400 mb-1 cursor-pointer hover:text-slate-200 transition"
                >
                  Data de Início
                </label>
                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    try {
                      dataInicioRef.current?.showPicker?.();
                    } catch {}
                    dataInicioRef.current?.focus();
                  }}
                >
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    ref={dataInicioRef}
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.target as HTMLInputElement).showPicker?.();
                      } catch {}
                    }}
                    style={{ colorScheme: 'dark' }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label
                  onClick={() => {
                    try {
                      dataFimRef.current?.showPicker?.();
                    } catch {}
                    dataFimRef.current?.focus();
                  }}
                  className="block text-xs text-slate-400 mb-1 cursor-pointer hover:text-slate-200 transition"
                >
                  Data de Término
                </label>
                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    try {
                      dataFimRef.current?.showPicker?.();
                    } catch {}
                    dataFimRef.current?.focus();
                  }}
                >
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    ref={dataFimRef}
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.target as HTMLInputElement).showPicker?.();
                      } catch {}
                    }}
                    style={{ colorScheme: 'dark' }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-400 items-center">
              <span>Atalhos:</span>
              {(dataInicio || dataFim) && (
                <button
                  type="button"
                  onClick={() => definirPeriodo('', '')}
                  className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/60 text-red-300 rounded border border-red-800/60 transition cursor-pointer"
                >
                  Limpar Período
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const y = now.getFullYear();
                  const m = String(now.getMonth() + 1).padStart(2, '0');
                  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
                  definirPeriodo(`${y}-${m}-01`, `${y}-${m}-${lastDay}`);
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition cursor-pointer"
              >
                Mês Vigente
              </button>
              <button
                type="button"
                onClick={() => definirPeriodo('2026-09-01', '2026-09-30')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition cursor-pointer"
              >
                Setembro / 2026
              </button>
              <button
                type="button"
                onClick={() => definirPeriodo('', '')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition cursor-pointer"
              >
                Todo o Histórico
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Registros Localizados
              </span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <strong>{servicosFiltrados.length}</strong> serviços
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <strong>{totalHoras.toFixed(2)}h</strong> total
                </span>
              </div>
            </div>

            {carregando ? (
              <p className="text-xs text-slate-400 py-3 text-center">Buscando lançamentos no banco de dados...</p>
            ) : servicosFiltrados.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-amber-400 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Nenhum serviço registrado neste intervalo de datas. O PDF sairá com a mensagem informativa.</span>
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {servicosFiltrados.slice(0, 5).map((s) => (
                  <div
                    key={s.id_servico}
                    className="p-2 rounded bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="truncate">
                      <span className="font-mono text-blue-400 mr-2">{s.data_visita}</span>
                      <span className="text-slate-300 font-medium mr-2">[{s.periodo}]</span>
                      <span className="text-slate-400 truncate">{s.descricao_servicos.split('\n')[0]}</span>
                    </div>
                    <span className="text-slate-400 shrink-0 font-medium">{s.qtde_horas}h</span>
                  </div>
                ))}
                {servicosFiltrados.length > 5 && (
                  <p className="text-[11px] text-slate-400 text-center pt-1">
                    + {servicosFiltrados.length - 5} outros registros incluídos no documento oficial
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleVisualizarPdf}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition cursor-pointer"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Prévia na Tela</span>
            </button>
            <button
              type="button"
              onClick={handleBaixarPdf}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Gerar Relatório (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
