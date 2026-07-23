import { api } from "./api";

export interface Feriado {
    dataFeriado: string;
    nomeFeriado: string;
    tipoFeriado: string;
    uf: string | null;
    municipio: string | null;
}

export async function getFeriados(ano: number): Promise<Feriado[]> {
    const response = await api.get<Feriado[]>("/feriados", { params: { ano } });
    return response.data;
}
