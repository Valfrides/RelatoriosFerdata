'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Download,
  Printer,
  FileText,
  FileCheck,
} from 'lucide-react';
import { DadosPreviaRelatorio } from '@/types';
import {
  formatarDataBR,
  formatarHorasBR,
  formatarDataExtenso,
  obterDescritivoFiliais,
  calcularSomatoriaFiliais,
} from '@/lib/pdf-generator';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dados?: DadosPreviaRelatorio | null;
  pdfDataUri?: string | null;
  titulo?: string;
  customLogo?: string | null;
}

export function PdfViewerModal({
  isOpen,
  onClose,
  dados,
  pdfDataUri: legacyPdfDataUri,
  titulo: legacyTitulo,
  customLogo: legacyCustomLogo,
}: PdfViewerModalProps) {
  const [modoVisualizacao, setModoVisualizacao] = useState<'folha' | 'pdf'>('folha');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pdfDataUri = dados?.pdfDataUri || legacyPdfDataUri || null;
  const titulo = dados?.titulo || legacyTitulo || 'Relatório de Serviços Técnicos';
  const customLogo = dados?.customLogo ?? legacyCustomLogo;

  const handleDownload = () => {
    if (dados?.onBaixarPdf) {
      dados.onBaixarPdf();
      return;
    }
    if (pdfDataUri) {
      const a = document.createElement('a');
      a.href = pdfDataUri;
      a.download = `${titulo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      a.click();
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const servicos = dados?.servicos || [];
  const totalHorasCalculado = Number(
    servicos.reduce((acc, s) => acc + (Number(s.qtde_horas) || 0), 0).toFixed(2)
  );
  const contratadas = Number(dados?.horasContratadas) || 52;
  const adicionais = Math.max(0, Number((totalHorasCalculado - contratadas).toFixed(2)));
  const filiaisSomatoria = dados ? calcularSomatoriaFiliais(servicos, adicionais, contratadas) : [];
  const descritivoFiliais = dados ? obterDescritivoFiliais(servicos, adicionais, contratadas) : '';

  const filiaisDistintas = Array.from(new Set(servicos.map((s) => s.nome_unidade).filter(Boolean)));
  const exibirColunaFilial = !dados?.unidadeNome && filiaisDistintas.length > 1;
  const dataAtualExtenso = formatarDataExtenso(new Date());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 print:p-0 print:bg-white print:static print:z-0">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[94vh] flex flex-col overflow-hidden shadow-2xl print:border-none print:shadow-none print:h-auto print:max-w-none print:bg-white">
        {/* Topo / Barra de Ferramentas da Prévia */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950 gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            {customLogo ? (
              <img
                src={customLogo}
                alt="Ferdata"
                className="w-8 h-8 rounded-lg object-contain shadow bg-white/5 p-0.5"
              />
            ) : (
              <Image
                src="/logo_ferdata.svg"
                alt="Ferdata"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-contain shadow"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Prévia na Tela
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">{titulo}</h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Visualização oficial de impressão – Formato A4 padrão Ferdata
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 flex-wrap">
            <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setModoVisualizacao('folha')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  modoVisualizacao === 'folha'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Visualização impressa de alta fidelidade"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Folha A4</span>
              </button>
              {pdfDataUri && (
                <button
                  type="button"
                  onClick={() => setModoVisualizacao('pdf')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    modoVisualizacao === 'pdf'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="PDF no visualizador do navegador"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Arquivo</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleImprimir}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
              title="Imprimir relatório diretamente"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
              title="Baixar arquivo PDF gerado"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Fechar Prévia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-950 p-2 sm:p-6 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white">
          {modoVisualizacao === 'folha' || !pdfDataUri ? (
            <div className="w-full max-w-[800px] bg-white text-slate-900 rounded-lg shadow-2xl p-6 sm:p-12 print:p-6 border border-slate-300 font-sans leading-normal print:border-none print:shadow-none print:max-w-none">
              <div className="relative pb-3 border-b border-slate-300">
                <div className="flex items-start justify-between">
                  <div className="w-20 h-16 sm:w-24 sm:h-20 relative shrink-0 flex items-center justify-center">
                    {customLogo ? (
                      <img
                        src={customLogo}
                        alt="Logotipo Ferdata"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Image
                        src="/logo_ferdata.svg"
                        alt="Logotipo Ferdata"
                        width={80}
                        height={60}
                        className="object-contain"
                      />
                    )}
                  </div>

                  <div className="flex-1 text-center px-2">
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                      FERDATA INFORMÁTICA
                    </h1>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
                      Assistência Técnica Especializada
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
                      Rua Manoel José de Santana, 39 – Vila Yara – Osasco
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">
                      CEP: 06020-060 – Tel: 3682-2562 – 3699-1815
                    </p>
                  </div>

                  <div className="w-20 sm:w-24 shrink-0 hidden sm:block" />
                </div>
              </div>

              <div className="py-2.5 text-center border-b border-slate-300">
                <h2 className="text-sm sm:text-base font-bold italic text-slate-800 tracking-wide uppercase">
                  Relatório De Serviços Técnicos
                </h2>
              </div>

              <div className="py-3 flex flex-col sm:flex-row sm:items-start justify-between text-xs sm:text-sm text-slate-800 gap-2 border-b border-slate-200">
                <div className="space-y-1">
                  <div>
                    <span className="font-bold">Cliente: </span>
                    <span className="italic">{dados?.clienteNome || 'Cliente Não Informado'}</span>
                  </div>
                  <div>
                    <span className="font-bold">A/C: </span>
                    <span className="italic">{dados?.contatoAC || '—'}</span>
                  </div>
                  {dados?.unidadeNome && (
                    <div>
                      <span className="font-bold">Unidade: </span>
                      <span className="italic">{dados.unidadeNome}</span>
                    </div>
                  )}
                </div>

                {dados?.dataInicio && dados?.dataFim && (
                  <div className="text-right sm:text-right text-xs text-slate-600 sm:self-start">
                    <span className="font-semibold text-slate-700">Período: </span>
                    <span>
                      {formatarDataBR(dados.dataInicio)} a {formatarDataBR(dados.dataFim)}
                    </span>
                  </div>
                )}
              </div>

              <div className="py-4">
                {servicos.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 italic bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    Nenhum serviço registrado para o período e unidade selecionados.
                  </div>
                ) : dados?.tipo === 'favorita_horas' ? (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-t-2 border-b-2 border-slate-900 italic font-bold text-slate-900">
                        <th className="py-2 px-2 w-32">Data</th>
                        {exibirColunaFilial && <th className="py-2 px-2">Filial / Unidade</th>}
                        <th className="py-2 px-2 w-28">Horas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {servicos.map((s, idx) => (
                        <tr key={s.id_servico || idx} className="hover:bg-slate-50/60">
                          <td className="py-1.5 px-2 font-medium text-slate-800">
                            {formatarDataBR(s.data_visita)}
                          </td>
                          {exibirColunaFilial && (
                            <td className="py-1.5 px-2 text-slate-700 font-medium">
                              {s.nome_unidade || 'Matriz'}
                            </td>
                          )}
                          <td className="py-1.5 px-2 font-semibold text-slate-900">
                            {formatarHorasBR(Number(s.qtde_horas) || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-t-2 border-b-2 border-slate-900 italic font-bold text-slate-900">
                        <th className="py-2 px-2 w-24">Data</th>
                        <th className="py-2 px-2 w-36">Período / Unidade</th>
                        <th className="py-2 px-2">Serviços Executados</th>
                        <th className="py-2 px-2 w-20 text-right">Horas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {servicos.map((s, idx) => (
                        <tr key={s.id_servico || idx} className="hover:bg-slate-50/60">
                          <td className="py-2 px-2 font-medium text-slate-800 align-top">
                            {formatarDataBR(s.data_visita)}
                          </td>
                          <td className="py-2 px-2 text-slate-700 align-top">
                            <div className="font-semibold">{s.periodo || '—'}</div>
                            {s.nome_unidade && (
                              <div className="text-[11px] text-slate-500 font-medium">
                                {s.nome_unidade}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-2 text-slate-800 align-top whitespace-pre-line text-left">
                            {s.descricao_servicos}
                          </td>
                          <td className="py-2 px-2 font-bold text-slate-900 text-right align-top">
                            {formatarHorasBR(Number(s.qtde_horas) || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {servicos.length > 0 && (
                <div className="mt-4 pt-2">
                  {dados?.tipo === 'favorita_horas' ? (
                    <div className="max-w-md bg-slate-50 border border-slate-300 rounded-lg p-3.5 text-xs space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold italic text-slate-800">Total horas:</span>
                        <span className="font-black text-slate-950 text-sm">
                          {formatarHorasBR(totalHorasCalculado)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold italic text-slate-800">
                          Total horas contratadas:
                        </span>
                        <span className="font-semibold text-slate-700">
                          {formatarHorasBR(contratadas)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold italic ${
                            adicionais > 0 ? 'text-red-700' : 'text-slate-800'
                          }`}
                        >
                          Total horas adicionais:
                        </span>
                        <span
                          className={`font-bold ${
                            adicionais > 0 ? 'text-red-700' : 'text-slate-900'
                          }`}
                        >
                          {formatarHorasBR(adicionais)}
                        </span>
                      </div>
                      {filiaisSomatoria.length > 0 && (
                        <div className="pt-2.5 border-t border-slate-300 mt-1.5">
                          <span className="font-bold italic text-slate-900 block mb-1">
                            Somatória por filial:
                          </span>
                          <div className="space-y-1 bg-white p-2 rounded border border-slate-200">
                            {filiaisSomatoria.map((f) => (
                              <div key={f.nome} className="flex items-center justify-between text-xs py-0.5">
                                <span className={`font-bold ${f.isSaoPaulo ? 'text-blue-900' : 'text-slate-900'}`}>
                                  • {f.nome}:
                                </span>
                                <span className={`font-mono font-semibold ${f.isSaoPaulo ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                                  {f.textoHoras}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-md bg-slate-50 border border-slate-300 rounded-lg p-3.5 text-xs space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold italic text-slate-800">Total de Chamados:</span>
                        <span className="font-bold text-slate-900">{servicos.length} chamados</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold italic text-slate-800">Total de Horas:</span>
                        <span className="font-black text-slate-950 text-sm">
                          {formatarHorasBR(totalHorasCalculado)} horas
                        </span>
                      </div>
                      {filiaisSomatoria.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 mt-1">
                          <span className="font-bold italic text-slate-900 block mb-1">
                            Somatória por filial:
                          </span>
                          <div className="space-y-1 bg-white p-2 rounded border border-slate-200">
                            {filiaisSomatoria.map((f) => (
                              <div key={f.nome} className="flex items-center justify-between text-xs py-0.5">
                                <span className="font-bold text-slate-900">
                                  • {f.nome}:
                                </span>
                                <span className="font-mono font-semibold text-slate-800">
                                  {f.textoHoras}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500 italic">
                <span>{dataAtualExtenso}</span>
                <span>Página 1 de 1</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <iframe
                src={pdfDataUri}
                className="w-full h-full rounded-xl border border-slate-800 bg-white"
                title="Prévia do Relatório em PDF"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
