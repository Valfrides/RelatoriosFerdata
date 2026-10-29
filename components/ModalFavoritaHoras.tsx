'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Download, Eye, Building, FileText, Settings2 } from 'lucide-react';
import { Cliente, Unidade, ServicoRealizadoCompleto, DadosPreviaRelatorio } from '@/types';
import {
  gerarRelatorioFavoritaHorasPDF,
  gerarRelatorioServicosPDF,
  formatarHorasBR,
  obterDescritivoFiliais,
  calcularSomatoriaFiliais,
} from '@/lib/pdf-generator';

interface ModalFavoritaHorasProps {
  clienteFavorita: Cliente | null;
  unidadesFavorita: Unidade[];
  isOpen: boolean;
  onClose: () => void;
  onVisualizarRelatorio: (dados: DadosPreviaRelatorio) => void;
  onVisualizarPdf?: (pdfDataUri: string, titulo: string) => void;
  customLogo?: string | null;
}

export function ModalFavoritaHoras({
  clienteFavorita,
  unidadesFavorita,
  isOpen,
  onClose,
  onVisualizarRelatorio,
  onVisualizarPdf,
  customLogo,
}: ModalFavoritaHorasProps) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [unidadeFiltro, setUnidadeFiltro] = useState<number | 'todas'>('todas');
  const [horasContratadas, setHorasContratadas] = useState<number>(52);
  const [tipoModelo, setTipoModelo] = useState<'favorita_horas' | 'completo_servicos'>('favorita_horas');
  const [servicos, setServicos] = useState<ServicoRealizadoCompleto[]>([]);
  const [carregando, setCarregando] = useState(false);

  const dataInicioRef = React.useRef<HTMLInputElement>(null);
  const dataFimRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDataInicio('');
      setDataFim('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!clienteFavorita || !isOpen) return;
    async function carregarHoras() {
      setCarregando(true);
      try {
        const params = new URLSearchParams();
        params.append('id_cliente', clienteFavorita!.id_cliente.toString());
        if (unidadeFiltro !== 'todas') {
          params.append('id_unidade', String(unidadeFiltro));
        }
        if (dataInicio) params.append('data_inicio', dataInicio);
        if (dataFim) params.append('data_fim', dataFim);
        const res = await fetch(`/api/servicos?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setServicos(data.data);
        }
      } catch (err) {
        console.error('Erro ao buscar horas Favorita:', err);
      } finally {
        setCarregando(false);
      }
    }
    carregarHoras();
  }, [clienteFavorita, unidadeFiltro, dataInicio, dataFim, isOpen]);

  if (!isOpen || !clienteFavorita) return null;

  const totalHorasGeral = Number(
    servicos.reduce((acc, s) => acc + (Number(s.qtde_horas) || 0), 0).toFixed(2)
  );
  const contratadas = Number(horasContratadas) || 52;
  const horasAdicionais = Math.max(0, Number((totalHorasGeral - contratadas).toFixed(2)));

  const horasPorUnidade: Record<string, { total: number; count: number }> = {};
  servicos.forEach((s) => {
    const nome = s.nome_unidade || 'Sem Unidade / Matriz';
    if (!horasPorUnidade[nome]) {
      horasPorUnidade[nome] = { total: 0, count: 0 };
    }
    horasPorUnidade[nome].total += Number(s.qtde_horas) || 0;
    horasPorUnidade[nome].count += 1;
  });

  const unidadeSelecionadaObj =
    unidadeFiltro !== 'todas'
      ? unidadesFavorita.find((u) => u.id_unidade === unidadeFiltro)
      : null;

  const obterDocPdf = () => {
    if (tipoModelo === 'favorita_horas') {
      return gerarRelatorioFavoritaHorasPDF({
        clienteNome: clienteFavorita.nome_empresa,
        contatoAC: clienteFavorita.contato_ac,
        unidadeNome: unidadeSelecionadaObj ? unidadeSelecionadaObj.nome_unidade : undefined,
        servicos,
        dataInicio,
        dataFim,
        horasContratadas: contratadas,
        dataEmissao: new Date(),
        customLogo,
      });
    }
    return gerarRelatorioServicosPDF({
      clienteNome: clienteFavorita.nome_empresa,
      contatoAC: clienteFavorita.contato_ac,
      unidadeNome: unidadeSelecionadaObj ? unidadeSelecionadaObj.nome_unidade : 'Consolidado Todas as Unidades',
      servicos,
      dataInicio,
      dataFim,
      dataEmissao: new Date(),
      customLogo,
    });
  };

  const handleBaixarPdf = () => {
    const doc = obterDocPdf();
    const sufixo = unidadeSelecionadaObj ? `_${unidadeSelecionadaObj.nome_unidade}` : '_Consolidado';
    const tipoSufixo = tipoModelo === 'favorita_horas' ? '_Horas_Totais' : '_Servicos_Detalhados';
    const periodoSufixo = dataInicio && dataFim ? `_${dataInicio}_a_${dataFim}` : '_Geral';
    doc.save(`Favorita${tipoSufixo}${sufixo}${periodoSufixo}.pdf`);
  };

  const handleVisualizarPdf = () => {
    const doc = obterDocPdf();
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const subtitulo = unidadeSelecionadaObj ? `(${unidadeSelecionadaObj.nome_unidade})` : '(Todas as Unidades)';
    const tipoNome = tipoModelo === 'favorita_horas' ? 'Favorita Horas' : 'Favorita Serviços Detalhados';
    const titulo = `${tipoNome} - ${subtitulo}`;

    if (onVisualizarRelatorio) {
      onVisualizarRelatorio({
        tipo: tipoModelo,
        titulo,
        clienteNome: clienteFavorita.nome_empresa,
        contatoAC: clienteFavorita.contato_ac,
        unidadeNome: unidadeSelecionadaObj ? unidadeSelecionadaObj.nome_unidade : undefined,
        dataInicio,
        dataFim,
        servicos,
        horasContratadas: contratadas,
        customLogo,
        pdfDataUri: blobUrl,
        onBaixarPdf: handleBaixarPdf,
      });
    } else if (onVisualizarPdf) {
      onVisualizarPdf(blobUrl, titulo);
    }
  };

  const filiaisSomatoria = calcularSomatoriaFiliais(servicos, horasAdicionais, contratadas);
  const descritivoFiliaisTexto = obterDescritivoFiliais(servicos, horasAdicionais, contratadas);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-amber-600/40 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/60 to-slate-950 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {customLogo ? (
              <img
                src={customLogo}
                alt="Logo Ferdata"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain shadow-md bg-white/5 p-0.5 shrink-0"
              />
            ) : (
              <Image
                src="/logo_ferdata.svg"
                alt="Ferdata"
                width={36}
                height={36}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain shadow-md shrink-0"
              />
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Favorita Horas – Apuração &amp; Relatório Oficial
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-300/80">
                Totalizador de horas cadastradas, franquia contratada e horas adicionais
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

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Filtrar Filial / Unidade</label>
              <select
                value={unidadeFiltro}
                onChange={(e) =>
                  setUnidadeFiltro(e.target.value === 'todas' ? 'todas' : Number(e.target.value))
                }
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 focus:ring-1 focus:ring-amber-500"
              >
                <option value="todas">Todas as Unidades (Consolidado Geral)</option>
                {unidadesFavorita.map((u) => (
                  <option key={u.id_unidade} value={u.id_unidade}>
                    {u.nome_unidade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                onClick={() => {
                  try {
                    dataInicioRef.current?.showPicker?.();
                  } catch {}
                  dataInicioRef.current?.focus();
                }}
                className="block text-xs text-slate-400 mb-1 cursor-pointer hover:text-white transition"
              >
                Data Início
              </label>
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
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 focus:ring-1 focus:ring-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <label
                onClick={() => {
                  try {
                    dataFimRef.current?.showPicker?.();
                  } catch {}
                  dataFimRef.current?.focus();
                }}
                className="block text-xs text-slate-400 mb-1 cursor-pointer hover:text-white transition"
              >
                Data Término
              </label>
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
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 focus:ring-1 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                Estrutura de Saída do PDF:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTipoModelo('favorita_horas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    tipoModelo === 'favorita_horas'
                      ? 'bg-amber-600 text-slate-950 font-bold shadow'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Favorita Horas (Data, Horas &amp; Totais)
                </button>
                <button
                  type="button"
                  onClick={() => setTipoModelo('completo_servicos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    tipoModelo === 'completo_servicos'
                      ? 'bg-blue-600 text-white font-bold shadow'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Completo (Serviços Executados)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Horas Contratadas no Contrato Mensal:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={horasContratadas}
                  onChange={(e) => setHorasContratadas(Number(e.target.value) || 0)}
                  className="w-16 text-center text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold"
                />
                <span className="text-slate-400">horas</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 space-y-3">
            <span className="text-[11px] font-bold text-amber-300/80 uppercase tracking-wider block">
              Descritivo da Soma Total de Horas no Período (Modelo Oficial)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Horas</span>
                <span className="text-lg font-black text-amber-400">
                  {formatarHorasBR(totalHorasGeral)} h
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Horas Contratadas</span>
                <span className="text-lg font-bold text-slate-200">
                  {formatarHorasBR(contratadas)} h
                </span>
              </div>
              <div
                className={`p-2.5 rounded-lg border ${
                  horasAdicionais > 0
                    ? 'bg-red-950/30 border-red-800/40'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <span className="text-[11px] text-slate-400 block">Horas Adicionais</span>
                <span
                  className={`text-lg font-black ${
                    horasAdicionais > 0 ? 'text-red-400' : 'text-slate-300'
                  }`}
                >
                  {formatarHorasBR(horasAdicionais)} h
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Chamados</span>
                <span className="text-lg font-bold text-white">
                  {servicos.length}
                </span>
              </div>
            </div>

            {filiaisSomatoria.length > 0 && (
              <div className="pt-2 border-t border-amber-800/40">
                <div className="flex items-center justify-between text-amber-300 text-xs font-bold mb-2">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>Somatória por Filial (Cobranças Adicionais):</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">
                    1 por linha
                  </span>
                </div>
                <div className="bg-slate-950/80 rounded-xl border border-slate-800 divide-y divide-slate-800/60 overflow-hidden shadow-inner">
                  {filiaisSomatoria.map((f) => (
                    <div
                      key={f.nome}
                      className={`flex items-center justify-between px-3.5 py-2 text-xs transition ${
                        f.isSaoPaulo
                          ? 'bg-amber-950/25 hover:bg-amber-950/40'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${f.isSaoPaulo ? 'bg-amber-400' : 'bg-blue-400'}`} />
                        <span className="font-bold text-white tracking-wide">
                          {f.nome}
                          {f.isSaoPaulo && (
                            <span className="ml-2 text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                              Adicionais Líquidas: {f.textoHoras}
                            </span>
                          )}
                        </span>
                      </div>
                      <span className={`font-mono font-bold ${f.isSaoPaulo ? 'text-amber-300 text-sm' : 'text-slate-200'}`}>
                        {f.textoHoras}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Lançamentos por Filial ({Object.keys(horasPorUnidade).length} filiais ativas no filtro)
            </span>
            {carregando ? (
              <p className="text-xs text-slate-400 py-4 text-center">Calculando horas da Favorita...</p>
            ) : Object.keys(horasPorUnidade).length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">Nenhum lançamento no período indicado.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {Object.entries(horasPorUnidade).map(([unidadeNome, info]) => (
                  <div
                    key={unidadeNome}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-200 truncate">{unidadeNome}</span>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-slate-400">{info.count} chamados</span>
                      <span className="font-bold text-amber-400">{formatarHorasBR(info.total)}h</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            Fechar
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVisualizarPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition cursor-pointer"
              title="Visualizar prévia oficial na tela"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Prévia na Tela</span>
            </button>
            <button
              type="button"
              onClick={handleBaixarPdf}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg text-sm font-bold shadow-lg shadow-amber-600/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Baixar Relatório</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
