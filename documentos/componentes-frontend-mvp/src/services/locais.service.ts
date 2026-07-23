import { api } from "./api";

export interface AnexoLocal {
  id: number;
  idLocal: number;
  urlArquivo: string;
  nome?: string;
  mimetype?: string;
}

export interface Local {
  id: number;
  nome: string;
  codigo?: string;
  endereco?: string;
  linkMapa?: string;
  externo?: boolean;
  AnexoLocal?: AnexoLocal[];
}

export interface CreateLocalDTO {
  nome: string;
  codigo?: string;
  endereco?: string;
  linkMapa?: string;
  externo?: boolean;
}

export interface UpdateLocalDTO extends Partial<CreateLocalDTO> {}

export const getLocais = async () => {
  const response = await api.get<Local[]>("/locais");
  return response.data;
};

export const getLocalById = async (id: number) => {
  const response = await api.get<Local>(`/locais/${id}`);
  return response.data;
};

export const createLocal = async (data: CreateLocalDTO | FormData) => {
  const response = await api.post<Local>("/locais", data);
  return response.data;
};

export const updateLocal = async (
  id: number,
  data: UpdateLocalDTO | FormData,
) => {
  const response = await api.put<Local>(`/locais/${id}`, data);
  return response.data;
};

export const deleteLocal = async (id: number) => {
  await api.delete(`/locais/${id}`);
};
