"use server"
import { ReservaFormData } from "./schema";
import { create, deleteReserva, update } from "@/services/reservas/reserva.service";
const filterAndMap = (obj: any) => {
    const payload: Record<string, any> = {};

    for (const key in obj) {
        const value = obj[key];

        if (value !== undefined && value !== '') {
            payload[key] = value;
        }
    }
    return payload;
}
export async function createReservaAction(data: ReservaFormData) {

    try {
        const payload = filterAndMap(data);
        const response = await create(payload);
        return { success: true, data: response };
    } catch (error: any) {
        const backendMessage = error.response?.data?.message;

        const finalMessage = Array.isArray(backendMessage)
            ? backendMessage[0]
            : backendMessage;

        throw new Error(finalMessage || "Erro interno no servidor");
    }
}
export async function updateReservaAction(id: number, data: ReservaFormData) {


    try {
        const payload = filterAndMap(data);
        const response = await update(id, payload);

        return { success: true, data: response.data };
    } catch (error: any) {
        const backendMessage = error.response?.data?.message;

        const finalMessage = Array.isArray(backendMessage)
            ? backendMessage[0]
            : backendMessage;

        throw new Error(finalMessage || "Erro interno no servidor");
    }
}
export async function deleteReservaAction(id: number): Promise<void> {

    try {
        const response = await deleteReserva(id);

        //   return { success: true, data: response };
    } catch (error: any) {
        const backendMessage = error.response?.data?.message;

        const finalMessage = Array.isArray(backendMessage)
            ? backendMessage[0]
            : backendMessage;

        throw new Error(finalMessage || "Erro interno no servidor");
    }
}