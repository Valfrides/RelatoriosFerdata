'use client';

import React, { useState } from 'react';
import { Cliente, Unidade } from '@/types';
import { PlusCircle, Clock, FileText, Search, Sparkles, Building, ChevronRight, ImageIcon } from 'lucide-react';

interface MenuRelatoriosProps {
  clientes: Cliente[];
  unidades: Unidade[];
  onSelecionarClienteParaRelatorio: (cliente: Cliente, unidade?: Unidade) => void;
  onAbrirCadastro: () => void;
  onAbrirFavoritaHoras: () => void;
  totalServicos: number;
  onAbrirUploadLogo?: () => void;
  customLogo?: string | null;
}

export function MenuRelatorios({
  clientes,
  unidades,
  onSelecionarClienteParaRelatorio,
  onAbrirCadastro,
  onAbrirFavoritaHoras,
  totalServicos,
  onAbrirUploadLogo,
  customLogo,
}: MenuRelatoriosProps) {
  const [busca, setBusca] = useState('');
  const [modoVisualizacao, setModoVisualizacao] = useState<'grid_classico' | 'cards_completos'>('grid_classico');

  const itensMenuClassico: Array<{
    id: string;
    titulo: string;
    cliente: Cliente | undefined;
    unidade?: Unidade;
    descricao?: string;
  }> = [];

  clientes.forEach((cli) => {
    const unidadesDesteCliente = unidades.filter((u) => u.id_cliente === cli.id_cliente);
    if (unidadesDesteCliente.length > 0) {
      unidadesDesteCliente.forEach((unid) => {
        itensMenuClassico.push({
          id: `${cli.id_cliente}-${unid.id_unidade}`,
          titulo: `${cli.nome_empresa.replace(' Transportes Ltda', '')} – ${unid.nome_unidade}`,
          cliente: cli,
          unidade: unid,
          descricao: `A/C: ${cli.contato_ac}`,
        });
      });
    } else {
      itensMenuClassico.push({
        id: `${cli.id_cliente}`,
        titulo: cli.nome_empresa.replace(' Corporation Inc.', ''),
        cliente: cli,
        descricao: `A/C: ${cli.contato_ac}`,
      });
    }
  });

  itensMenuClassico.sort((a, b) => a.titulo.localeCompare(b.titulo));

  const itensFiltrados = itensMenuClassico.filter((item) =>
    item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    (item.descricao && item.descricao.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modernização do Sistema Microsoft Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Menu de Relatórios Técnicos
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Clique em qualquer cliente ou filial abaixo para selecionar o período e gerar
              imediatamente o relatório formal em PDF com o layout oficial da Ferdata Informática.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={onAbrirCadastro}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all border border-red-500/50 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Cadastrar Serviços</span>
            </button>

            <button
              onClick={onAbrirFavoritaHoras}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all border border-amber-400/50 cursor-pointer"
            >
              <Clock className="w-5 h-5 text-slate-950" />
              <span>Favorita Horas</span>
            </button>

            {onAbrirUploadLogo && (
              <button
                onClick={onAbrirUploadLogo}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition shadow cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>{customLogo ? 'Alterar Logotipo' : 'Personalizar Logotipo'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar cliente ou unidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs text-slate-400">
            <span>Visualização:</span>
            <button
              onClick={() => setModoVisualizacao('grid_classico')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                modoVisualizacao === 'grid_classico'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Botões do Menu (Access)
            </button>
            <button
              onClick={() => setModoVisualizacao('cards_completos')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                modoVisualizacao === 'cards_completos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Cards por Empresa
            </button>
          </div>
        </div>
      </div>

      {modoVisualizacao === 'grid_classico' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider text-slate-400">
              Painel de Clientes ({itensFiltrados.length} opções disponíveis)
            </span>
            <span>Clique para selecionar o período e emitir o PDF</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
            {itensFiltrados.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.cliente) {
                    onSelecionarClienteParaRelatorio(item.cliente, item.unidade);
                  }
                }}
                className="group relative flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 hover:from-blue-900/90 hover:via-blue-950 hover:to-slate-900 border-2 border-blue-900/60 hover:border-blue-500/80 shadow-md hover:shadow-xl hover:shadow-blue-600/20 transition-all text-left group hover:scale-[1.01] cursor-pointer"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-base font-bold text-white group-hover:text-blue-200 block truncate tracking-wide">
                      {item.titulo}
                    </span>
                    <span className="text-xs text-slate-400 block truncate">
                      {item.descricao}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="hidden sm:inline-block text-[11px] font-medium text-blue-400/80 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                    Emitir PDF
                  </span>
                  <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.map((cli) => {
            const filiais = unidades.filter((u) => u.id_cliente === cli.id_cliente);
            return (
              <div
                key={cli.id_cliente}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white">{cli.nome_empresa}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">A/C: {cli.contato_ac || '—'}</p>
                    </div>
                    <span className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                      <Building className="w-4 h-4" />
                    </span>
                  </div>

                  {filiais.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                        Filiais ({filiais.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {filiais.map((f) => (
                          <button
                            key={f.id_unidade}
                            onClick={() => onSelecionarClienteParaRelatorio(cli, f)}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition cursor-pointer"
                          >
                            {f.nome_unidade}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onSelecionarClienteParaRelatorio(cli)}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Emitir Relatório de Período</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
