export type Evento = {
  id: string;
  titulo: string;
  local: string;
  uf: string;
  data: string;
  solicitante: string;
  descricao: string;
  status: string;
  prioridade: string;
  Reserva?: { id: number }[];
  dataFim: string;
  idComplexidade?: any;
  idTicket?: string;
  Situacao?: { nome: string };
  Status_Relation?: { id: number; status: string };
  Periodos?: { id: number; dataInicio: string; dataFim: string }[];
  FluxoStatusEvento?: {
    id: number;
    dataMovimentacao: string;
    justificativa: string | null;
    usuario: string;
    StatusAtual: { id: number; status: string };
  }[];
  necessitaAjuste?: boolean;
  classificacaoEsforco?: string | null;
  NivelAssessoria?: { nivel: number } | null;
  Complexidade?: { nome: string };
};
