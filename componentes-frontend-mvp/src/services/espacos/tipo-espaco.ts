export type Espaco = {
    Id: number; // Backend might return Id, need to handle mapping if consistent
    nome: string;
    codigo?: string;
    capacidade?: number;
    caracteristicas?: string;
    ativo?: boolean;
    local?:string;
    Local?:{    id:string;
                codigo?:string;
                nome?:string;
                externo?: Boolean}
    idLocal?: number;
};
