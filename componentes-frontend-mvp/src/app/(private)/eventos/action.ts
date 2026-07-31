"use server";

import { createEventos, updateEventos } from "@/services/eventos.service";
import { FormularioEventosData } from "./schema";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { deleteEvento } from "@/services/eventos/evento.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth/config";

function handlerMappedData(data: any) {
  return {
    idTamanho: data.tamanho,
    idFormato: data.formato,
    idSituacao: data.status,
    idPeriodicidade: data.frequencia,
    idComplexidade: data.complexidade,
    idFaseProjeto: data.faseProjeto,
    idCategoria: data.categoria,
    idTipo: data.tipo,
    dataInicio: data.dataInicio,
    dataFim: data.dataFim,
    nomeProdutor: data.nomeProdutor,
    nome: data.nome,
    descricao: data.descricao,
    duracao: data.duracao,
    idNumeroParticipantes: data.guestCount,
    previstoNoOrcamento: data.previstoNoOrcamento,
    solenidade: data.isCeremonial,
    producaoEstande: data.producaoEstande,
    integrado: data.integrado,
    jornada: data.jornada,
    observacao: data.observacao,
    detalhesPlanejamento: data.planejamento,
    idEntidade: data.idEntidade,
    estado: data.estado,
    pais: data.pais,

    demandantesEvento: data.demandantesEvento
      ? data.demandantesEvento
      : Array.isArray(data.demandantesArea)
        ? data.demandantesArea.map((m: any) => {
          m.demandanteId = Number.parseInt(m.demandanteId);
          return {
            demandanteId: m.demandanteId,
            dadosContato: m.dadosContato,
          };
        })
        : undefined,
    reservaId: data.reservaId,
    idsReservas: data.idsReservas,
    idsTematicas: data.idsTematicas,
  };
}
export async function createEventoAction(data: any) {
  try {
    const isFormData =
      typeof data === "object" &&
      data !== null &&
      typeof data.append === "function";
    let payload;

    if (isFormData) {
      payload = data;
    } else {
      // Os dados já chegam mapeados pelo handlerDadosMapeados do formulário.
      // Apenas filtra valores vazios/nulos.
      const cleanPayload: Record<string, any> = {};
      for (const key in data) {
        const value = (data as any)[key];
        if (value !== undefined && value !== null && value !== "") {
          cleanPayload[key] = value;
        }
      }
      payload = cleanPayload;
    }

    const response = await createEventos(payload);

    return { success: true, data: response };
  } catch (error: any) {
    console.error(
      "Erro Axios/Server Action:",
      error?.response?.data || error.message,
    );
    return {
      success: false,
      error: "Erro ao criar evento"
    };
  }
}

export async function updateEventoAction(id: number, data: any) {
  const filterAndMap = (obj: any) => {
    const payload: Record<string, any> = {};

    for (const key in obj) {
      const value = obj[key];

      if (value !== undefined && value !== "") {
        payload[key] = value;
      }
    }
    // Remove fields that should not be in the DTO body
    delete payload.mapFile;
    return payload;
  };

  try {
    const isFormData =
      typeof data === "object" &&
      data !== null &&
      typeof data.append === "function";
    let payload;



    if (isFormData) {
      payload = new FormData();
      try {
        const d_keys = [];
        for (const [key, val] of data.entries()) {
          d_keys.push(
            `${key} -> ${val ? (val as File).name || typeof val : "null"}`,
          );
          payload.append(key, val); // We build a fresh FormData object for fetch
        }

      } catch (e: any) {
        console.error(`Failed to iterate data entries: ${e.message}\n`);
      }
    } else {
      payload = filterAndMap(data);

      if (payload.planejamento) {
        payload.detalhesPlanejamento = payload.planejamento;
      }
      delete payload.planejamento;
      delete payload.complexidade;
    }

    // Capture User Session for Author Tracking
    const session = await getServerSession(authOptions);
    const userObj = session?.user as any;

    if (userObj) {
      const idUsuario = userObj.oid || userObj.sub || userObj.email || "Sistema";
      const emailUsuario = (session as any)?.email || userObj.email || "Desconhecido";

      if (payload instanceof FormData) {
        payload.append("idUsuarioOriginal", idUsuario);
        payload.append("emailUsuario", emailUsuario);
      } else {
        payload.idUsuarioOriginal = idUsuario;
        payload.emailUsuario = emailUsuario;
      }
    }

    // console.log(
    //   "[updateEventoAction] Calling service with payload type:",
    //   payload?.constructor?.name,
    // );
    const response = await updateEventos(id, payload);

    revalidatePath("/(private)/eventos", "layout");
    revalidatePath(`/eventos/editar/${id}`);
    revalidatePath(`/eventos/visualizar/${id}`);
    revalidatePath("/eventos");

    return { success: true, data: response };
  } catch (error: any) {
    console.error("Erro Axios/Server Action:", error?.response?.data || error);
    const backendMessage = error.response?.data?.message || error.message;
    const finalMessage = Array.isArray(backendMessage)
      ? backendMessage[0]
      : backendMessage;
    return { success: false, error: finalMessage || "Erro ao atualizar evento" };
  }
}
export async function deleteEventoAction(id: number): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await deleteEvento(id.toString());
    return { success: true, data: response };
  } catch (error: any) {
    const backendMessage = error.response?.data?.message;
    const finalMessage = Array.isArray(backendMessage)
      ? backendMessage[0]
      : backendMessage;

    return { success: false, error: finalMessage || "Erro interno no servidor" };
  }
}
