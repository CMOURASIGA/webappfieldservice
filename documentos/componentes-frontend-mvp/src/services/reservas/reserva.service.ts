import { ReservaFormData } from "@/app/(private)/reservas/schema";
import { api, httpAuthServer } from "../api";

async function handleResponse(response: Response) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err: any = new Error(
      Array.isArray(data?.message) ? data.message[0] : data?.message || `Erro ${response.status}`
    );
    err.response = { data };
    throw err;
  }
  return response.json().catch(() => ({}));
}

export async function create(reserva: any) {
  const response = await api.post('/reservas', reserva);
  return response.data;
}

export async function update(id: number, reserva: any) {
  delete reserva.id;
  const response = await httpAuthServer(`/reservas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reserva),
  });
  return handleResponse(response);
}

export async function deleteReserva(id: number) {
  const response = await httpAuthServer(`/reservas/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}
export async function getReservas(filtros: any): Promise<any[]> {
    const params = new URLSearchParams(filtros).toString();
    const response = await api.get(`/reservas?${params}`);
    return response.data;
}

export async function findbyId(id:number) {
    const response=  await api.get(`/reservas/${id}`);
    return response.data

}
