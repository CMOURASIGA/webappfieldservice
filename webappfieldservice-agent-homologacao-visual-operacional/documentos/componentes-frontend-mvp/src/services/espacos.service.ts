import { EspacoFormData } from "@/app/(private)/espacos/schema";
import { api, httpAuthServer } from "./api";

async function parseServerResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

export async function getAllLocais() {
  const response = await api.get("/dominios/locais");
  return response.data;
}
export async function create(data: EspacoFormData) {
  const response = await httpAuthServer("/espacos", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const responseData = await parseServerResponse(response);
  if (!response.ok || !responseData) {
    throw new Error(`Erro ao criar espacos. Status: ${response.status}`);
  }
  return { data: responseData, status: response.status };
}
export async function update(id: number, data: any) {
  const response = await httpAuthServer(`/espacos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  const responseData = await parseServerResponse(response);
  if (!response.ok || !responseData) {
    throw new Error(`Erro ao atualizar espacos. Status: ${response.status}`);
  }
  return { data: responseData, status: response.status };
}
export async function getEspacoById(id: number) {
  const response = await api.get(`/espacos/${id}`);
  if (!response.data) {
    throw new Error(`Erro ao trazer espaco: ${response.status}`);
  }
  return response;
}
export async function getCaracteristicas() {
  const response = await api.get("/caracteristicas/");
  return response.data;
}

export async function createCaracteristica(data: { nome: string }) {
  const response = await httpAuthServer("/caracteristicas", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const responseData = await parseServerResponse(response);
  if (!response.ok || !responseData) {
    throw new Error(`Erro ao criar caracteristica. Status: ${response.status}`);
  }
  return { data: responseData, status: response.status };
}

// Get all spaces with complete data (including idLocal)
export async function getAllEspacosComplete() {
  const response = await api.get("/espacos");

  return response.data;
}
