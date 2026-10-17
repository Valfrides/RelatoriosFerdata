export interface Cliente {
  id_cliente: number;
  nome_empresa: string;
  contato_ac: string;
  created_at?: string;
}

export interface Unidade {
  id_unidade: number;
  id_cliente: number;
  nome_unidade: string;
  created_at?: string;
}

export interface ServicoRealizado {
  id_servico: number;
  id_cliente: number;
  id_unidade?: number | null;
  data_visita: string; // YYYY-MM-DD
  periodo: string; // Ex: "10:00 às 16:00 Horas" ou "02 Horas de laboratório"
  qtde_horas: number;
  descricao_servicos: string;
  created_at?: string;
}

export interface ServicoRealizadoCompleto extends ServicoRealizado {
  nome_empresa?: string;
  contato_ac?: string;
  nome_unidade?: string;
}

export interface FiltroRelatorio {
  id_cliente: number;
  id_unidade?: number | null;
  data_inicio: string; // YYYY-MM-DD
  data_fim: string; // YYYY-MM-DD
}

export interface DadosPreviaRelatorio {
  tipo: 'geral' | 'favorita_horas' | 'completo_servicos';
  titulo: string;
  clienteNome: string;
  contatoAC?: string;
  unidadeNome?: string;
  dataInicio?: string;
  dataFim?: string;
  servicos: ServicoRealizadoCompleto[];
  horasContratadas?: number;
  customLogo?: string | null;
  pdfDataUri?: string | null;
  onBaixarPdf?: () => void;
}

export interface Usuario {
  id: string;
  username: string;
  nome: string;
  perfil: 'admin' | 'tecnico' | 'operador';
  email?: string;
  created_at?: string;
}
