import { Evento } from "@/app/(private)/eventos/evento";
import { api, httpAuthServer } from "./api";
import { EventoDTO, EventoSimilar } from "@/app/(private)/eventos/eventoDTO";
import { AxiosResponse } from "axios";
import { EventoSimples } from "@/components/eventos/dashboard/proximos-eventos";

const endpointBase = "/eventos";

export async function createEventos(data: any) {
  const isFormData =
    typeof data === "object" &&
    data !== null &&
    typeof data.append === "function";

  try {
    const response = await httpAuthServer(endpointBase, {
      method: "POST",
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao criar evento");
    }

    return await response.json();
  } catch (error: any) {
    const errorMessage = error.message || "Erro ao criar evento";
    throw new Error(errorMessage);
  }
}

export async function updateEventos(id: number, data: any) {
  const isFormData =
    typeof data === "object" &&
    data !== null &&
    typeof data.append === "function";

  try {

    const response = await httpAuthServer(`${endpointBase}/${id}`, {
      method: "PUT",
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) return null;
      const errText = await response.text();

      let finalMessage = `Erro: ${response.status} - ${errText}`;
      try {
        const jsonError = JSON.parse(errText);
        if (jsonError.message) {
          finalMessage = Array.isArray(jsonError.message)
            ? jsonError.message.join(", ")
            : jsonError.message;
        }
      } catch (e) {
        // Not a JSON
      }

      console.error(
        `[updateEventos] Error status ${response.status}: ${errText}`,
      );
      throw new Error(finalMessage);
    }

    const resJson = await response.json();

    return resJson;
  } catch (error: any) {
    console.error("Erro ao atualizar Eventos:", error);
    console.error(`[updateEventos] Exception: ${error.message}`);
    throw error;
  }
}
export async function getProximosEventos(
  currentEventId?: number,
): Promise<EventoSimples[]> {
  const params = currentEventId ? { idEvento: currentEventId } : {};
  const response = await api.get(`/eventos/proximos`, { params });
  return response.data.data;
}

export async function getProximosEventosServer(
  currentEventId?: number,
): Promise<EventoSimples[]> {
  const url = currentEventId
    ? `/eventos/proximos?idEvento=${currentEventId}`
    : `/eventos/proximos`;
  const response = await httpAuthServer(url);
  if (!response.ok) {
    throw new Error(`Erro fetch proximos eventos: ${response.status}`);
  }
  const json = await response.json();
  return json.data;
}

export async function getAgendaEvents(
  startDate: Date,
  endDate: Date,
): Promise<EventoDTO[]> {
  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();
  const response = await api.get(`/eventos/agenda`, {
    params: {
      startDate: startIso,
      endDate: endIso,
    },
  });
  return response.data;
}

export async function getAgendaEventsServer(
  startDate: Date,
  endDate: Date,
): Promise<EventoDTO[]> {
  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  const response = await httpAuthServer(
    `/eventos/agenda?startDate=${encodeURIComponent(startIso)}&endDate=${encodeURIComponent(endIso)}`,
  );
  if (!response.ok) {
    const errText = await response.text().catch(() => "no-text");
    console.error(
      `[getAgendaEventsServer] ERRO ${response.status} ${response.statusText} - ${errText}`,
    );
    throw new Error(`Erro fetch agenda events: ${response.status}`);
  }
  return response.json();
}

export async function getTematicas(): Promise<string[]> {
  const response =
    await api.get<{ id: number; nome: string }[]>(`/eventos/tematicas`);
  return response.data.map((t) => t.nome);
}

export async function getTematicasServer(): Promise<string[]> {

  const response = await httpAuthServer(`/eventos/tematicas`);
  if (!response.ok) {
    const errText = await response.text().catch(() => "no-text");
    console.error(
      `[getTematicasServer] ERRO ${response.status} ${response.statusText} - ${errText}`,
    );
    throw new Error(`Erro fetch tematicas: ${response.status}`);
  }
  const data = await response.json();
  return data.map((t: any) => t.nome);
}

export async function getEventosById(id: number): Promise<AxiosResponse> {
  return api.get(`eventos/${id}`);
}

export async function getAgideskData(id: string): Promise<any> {
  const response = await api.get(`/eventos/agidesk/${id}`);
  return response.data;
}

export async function getEventosByIdServer(id: number): Promise<any> {
  const url = `/eventos/${id}`;

  const response = await httpAuthServer(url);
  if (!response.ok) {
    const errText = await response.text().catch(() => "no-text");
    console.error(
      `[getEventosByIdServer] ERRO ${response.status} ${response.statusText} - ${errText}`,
    );
    if (response.status === 404) return null;
    throw new Error(`Erro fetch evento by id: ${response.status}`);
  }
  const json = await response.json();
  // Assume that the backend returns the event object directly, just like before where axios returned it inside .data.
  // Wait, if it does wrap in { data: {...} }, we must handle it. But Event objects have a "data" property (date of the event).
  // If the backend wraps it, it's usually json.data.id etc. If not, it's json.id.
  return json.id ? json : json.data || json;
}

export async function getDashboardGerencial(dias: number = 30, dataInicio?: string, dataFim?: string) {
  let url = `/eventos/dashboard/gerencial?dias=${dias}`;
  if (dataInicio) url += `&dataInicio=${dataInicio}`;
  if (dataFim) url += `&dataFim=${dataFim}`;
  const response = await api.get(url);
  return response.data;
}

export async function getDashboardOperacional() {
  const response = await api.get(`/eventos/dashboard/operacional`);
  return response.data;
}
