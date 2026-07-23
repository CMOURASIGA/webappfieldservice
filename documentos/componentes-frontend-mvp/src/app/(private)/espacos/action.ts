"use server";
import {
  create,
  update,
  createCaracteristica,
} from "@/services/espacos.service";
import { deleteEspaco } from "@/services/espacos/espaco.service";
import { EspacoFormData } from "./schema";
import { AxiosPromise } from "axios";

export async function createCaracteristicaAction(data: { nome: string }) {
  try {
    const response = await createCaracteristica(data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erro Axios/Server Action:", error);
    throw new Error(
      "Erro ao criar caracteristica. Verifique os dados e tente novamente.",
    );
  }
}

export async function createEspacoAction(data: EspacoFormData) {
  try {
    const response = await create(data);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erro Axios/Server Action:", error);
    throw new Error(
      "Erro ao criar evento. Verifique os dados e tente novamente.",
    );
  }
}
export async function updateEspacoAction(id: number, data: EspacoFormData) {
  try {

    const response = await update(id, data);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erro Axios/Server Action:", error);
    throw new Error(
      "Erro ao criar evento. Verifique os dados e tente novamente.",
    );
  }
}
export async function deleteEspacoAction(id: number): Promise<any> {
  try {
    const response = await deleteEspaco(id);

    return { success: true, data: response };
  } catch (error: any) {
    const backendMessage = error.response?.data?.message;

    const finalMessage = Array.isArray(backendMessage)
      ? backendMessage[0]
      : backendMessage;

    throw new Error(finalMessage || "Erro interno no servidor");
  }
}
