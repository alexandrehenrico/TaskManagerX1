export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  email: string;
  telefone: string;
  fotoPerfil?: string;
  criadoEm: string;
}

export interface Pessoa {
  id: string;
  nome: string;
  cargo: string;
  email?: string;
  telefone?: string;
  fotoPerfil?: string;
  historicoAtividades: string[];
  criadoEm: string;
}

export interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  pessoaId: string;
  dataInicio: string;
  prazoFinal: string;
  status: 'pendente' | 'iniciada' | 'concluida' | 'atrasada';
  historico: HistoricoItem[];
  anexos: string[];
  lembreteNotificacao: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface HistoricoItem {
  data: string;
  acao: string;
  observacao?: string;
}

export interface NotificationConfig {
  enabled: boolean;
  resumoDiario: boolean;
  horarioResumoDiario: string;
  lembreteIndividual: boolean;
}