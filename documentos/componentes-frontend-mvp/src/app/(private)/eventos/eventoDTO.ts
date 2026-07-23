import { EventoSimples } from "@/components/eventos/dashboard/proximos-eventos";
import { Evento } from "./evento";

export type EventoStatus = "planejado" | "execucao" | "concluido" | "cancelado";
export type EventoFrequencia = "unico" | "mensal" | "semestral" | "anual";
export type EventoTamanho = "pequeno" | "medio" | "grande" | "megaevento";
export type EventoFormato = "presencial" | "online" | "hibrido";
export type EventoComplexidade = "baixa" | "media" | "alta";
export type EventoFase =
  | "concepcao"
  | "planejamento"
  | "execucao"
  | "encerramento";
export type EventoTipo = "interno" | "externo" | "misto";

export interface EventoDTO {
  id: string;

  nome: string;
  dataInicio: Date;
  dataFim: Date;
  status: EventoStatus;
  duracao: string;
  frequencia: EventoFrequencia;

  idEspaco: string;
  local: string;
  Espaco: {
    nome: string;
    Local: {
      nome: string;
    }
  }
  isExterno: boolean;
  estrategico?: boolean;
  pais?: string;
  estado?: string;

  idNumeroParticipantes: number | undefined;
  tamanho: EventoTamanho;
  formato: EventoFormato;

  areaCliente: string;
  nomeProdutor: string;
  entidadeParceira?: string;
  contatoInfo?: string;
  descricao: string;
  previstoNoOrcamento: boolean;

  complexidade: EventoComplexidade;
  faseProjeto: EventoFase;
  tipo?: string | EventoTipo;
  segmento?: string;
  categoria?: string;
  classificacao?: string;
  entidadeEmpresa?: string;
  publicoAlvo?: string;
  segmentoPublico?: string;
  detalhesPlanejamento?: string;
  Tematica: {
    id: number;
    nome: string;
  }
  integrado: boolean;
  solenidade: boolean;
  producaoEstande: boolean;
  jornadaCliente?: string;

  legislacao: boolean;
  jornadaParticipante: boolean;
  idFaixaAutoridade?: number;
  idFaixaAtivacao?: number;
  idPacoteServico?: number;
  idNivelContratacao?: number;

  urlMapa?: string;
  Periodos?: {
    id: number;
    dataInicio: string | Date;
    dataFim: string | Date;
  }[];
  eventoSimilaresCategoria?: EventoSimilar[];
  eventoSimilaresArea?: EventoSimples[];
}

export interface EventoSimilar {
  id: number;
  nome: string | null;
  descricao: string | null;
  dataInicio: string | null;
  dataFim: Date | null;
  estado: string | null;
  pais: string | null;
  status: string | null;
  nomeProdutor: string | null;

  DemandanteEvento: Array<{
    id: number;
    Demandante: {
      id: number;
      nome: string | null;
    } | null;
  }>;
}
