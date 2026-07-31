export interface Reserva {
    id: number;
    idEspaco: number;
    idEvento?: number;
    idSolicitacao?: number;
    dataInicio: string;
    dataFim: string;
    motivo: string;
    Espaco?: any;
    Evento?: any;
    Solicitacao?: any;
}

export interface FiltroReserva {
    idEspaco?: number;
    idEvento?: number;
    motivo?: string;
    solicitante?: string;
    dataInicio?: string;
    dataFim?: string;
    status?: string;
    disponiveis?: boolean;
}

export interface UpdateReservaData {
    idEspaco?: number;
    idEvento?: number;
    idSolicitacao?: number;
    dataInicio?: string;
    dataFim?: string;
    motivo?: string;
}
