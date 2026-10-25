'use client';

import React, { useState } from 'react';
import { ServicoRealizadoCompleto, Cliente, Unidade } from '@/types';
import { Search, Download, Trash2, Edit2 } from 'lucide-react';
import { formatarDataBR } from '@/lib/pdf-generator';

interface HistoricoServicosProps {
  servicos: ServicoRealizadoCompleto[];
  clientes: Cliente[];
  unidades: Unidade[];
  onAtualizar: () => void;
  onEditarServico: (servico: ServicoRealizadoCompleto) => void;
}

export function HistoricoServicos({
  servicos,
  clientes,
  unidades,
  onAtualizar,
  onEditarServico,
}: HistoricoServicosProps) {
  const [busca, setBusca] = useState('');
  const [clienteFiltro, setClienteFiltro] = useState<string>('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const servicosFiltrados = servicos.filter((s) => {
    if (clienteFiltro !== 'todos' && s.id_cliente !== Number(clienteFiltro)) {
      return false;
    }
    if (dataInicio && s.data_visita < dataInicio) {
      return false;
    }
    if (dataFim && s.data_visita > dataFim) {
      return false;
    }
    if (busca) {
      const b = busca.toLowerCase();
      const matchEmpresa = s.nome_empresa?.toLowerCase().includes(b);
      const matchUnidade = s.nome_unidade?.toLowerCase().includes(b);
      const matchDesc = s.descricao_servicos.toLowerCase().includes(b);
      const matchPeriodo = s.periodo.toLowerCase().includes(b);
      const matchData = s.data_visita.includes(b);
      if (!matchEmpresa && !matchUnidade && !matchDesc && !matchPeriodo && !matchData) {
        return false;
      }
    }
    return true;
  });

  const totalHoras = servicosFiltrados.reduce((acc, s) => acc + (Number(s.qtde_horas) || 0), 0);

  const exportarCSV = () => {
    const cabecalho = 'ID,Data,Cliente,Unidade,Período,Horas,Serviços Realizados\n';
    const linhas = servicosFiltrados.map((s) => {
      const descLimpa = `"${s.descricao_servicos.replace(/"/g, '""')}"`;
      const empresa = `"${s.nome_empresa || ''}"`;
      const unidade = `"${s.nome_unidade || ''}"`;
      const periodo = `"${s.periodo}"`;
      return `${s.id_servico},${formatarDataBR(s.data_visita)},${empresa},${unidade},${periodo},${s.qtde_horas},${descLimpa}`;
    });
    const conteudo = cabecalho + linhas.join('\n');
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Servicos_Ferdata_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExcluir = async (id: number) => {
    if (confirm(`Deseja realmente excluir o serviço #${id}? Esta ação não pode ser desfeita.`)) {
      await fetch(`/api/servicos/${id}`, { method: 'DELETE' });
      onAtualizar();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Histórico Geral de Serviços</h2>
            <p className="text-xs text-slate-400">
              Consulte, filtre e gerencie todos os registros técnicos armazenados
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportarCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Buscar Texto</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: Formatação, VPN, cabo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Filtrar Cliente</label>
            <select
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
            >
              <option value="todos">Todos os Clientes</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nome_empresa}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">A Partir De</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              onClick={(e) => {
                try {
                  (e.target as HTMLInputElement).showPicker?.();
                } catch {}
              }}
              style={{ colorScheme: 'dark' }}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Até</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              onClick={(e) => {
                try {
                  (e.target as HTMLInputElement).showPicker?.();
                } catch {}
              }}
              style={{ colorScheme: 'dark' }}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-4">
            <span>
              Exibindo <strong>{servicosFiltrados.length}</strong> de <strong>{servicos.length}</strong> serviços
            </span>
            <span>•</span>
            <span>
              Total de Horas: <strong className="text-amber-400">{totalHoras.toFixed(2)}h</strong>
            </span>
          </div>
          {(busca || clienteFiltro !== 'todos' || dataInicio || dataFim) && (
            <button
              onClick={() => {
                setBusca('');
                setClienteFiltro('todos');
                setDataInicio('');
                setDataFim('');
              }}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Unidade</th>
                <th className="py-3 px-4">Período</th>
                <th className="py-3 px-4">Horas</th>
                <th className="py-3 px-4">Serviços Executados</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {servicosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhum serviço atende aos critérios de filtro informados.
                  </td>
                </tr>
              ) : (
                servicosFiltrados.map((item) => (
                  <tr key={item.id_servico} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-500">#{item.id_servico}</td>
                    <td className="py-3 px-4 font-mono font-medium text-blue-400 whitespace-nowrap">
                      {formatarDataBR(item.data_visita)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      {item.nome_empresa}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {item.nome_unidade || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-medium">
                      {item.periodo}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {item.qtde_horas}h
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-pre-line max-w-md">
                      {item.descricao_servicos}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onEditarServico(item)}
                        className="p-1.5 text-blue-400 hover:text-white hover:bg-slate-800 rounded transition mr-1 cursor-pointer"
                        title="Editar lançamento"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExcluir(item.id_servico)}
                        className="p-1.5 text-red-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
