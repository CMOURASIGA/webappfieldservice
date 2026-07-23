"use client";

import Link from "next/link";
import { Search, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reserva } from "@/services/reservas/tipo-reserva";

interface ListaReservasEspacoProps {
    title: string;
    reservas: any[]; // Ajuste para o seu tipo de Reserva vindo do Nest
    espacoId?: number;
    totalReservas?: number;
    className?: string;
}

export function ListaReservasEspaco({
    title,
    reservas,
    espacoId,
    totalReservas = 0,
    className
}: ListaReservasEspacoProps) {

    // Formata o período de tempo (Ex: 08:00 - 12:00)
    const formatarHorario = (inicio: string, fim: string) => {
        try {
            const hInicio = new Date(inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const hFim = new Date(fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return `${hInicio} - ${hFim}`;
        } catch {
            return "-";
        }
    };

    return (
        <div className={cn("border border-gray-100 bg-white rounded-lg shadow-sm", className)}>
            <div className="p-4 md:px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <CalendarDays className="text-blue-600" size={20} />
                    {title} {reservas.length >= 4 ? '4' : reservas.length} reservas
                </h3>
                {totalReservas > 0 && (
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {totalReservas} total
                    </span>
                )}
            </div>

            <div className="p-4 md:px-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-sm text-gray-500 border-b border-gray-50">
                                <th className="pb-3 font-normal">Data</th>
                                <th className="pb-3 font-normal">Horário</th>
                                <th className="pb-3 font-normal">Evento / Motivo</th>
                                <th className="pb-3 font-normal">Solicitante</th>
                                <th className="pb-3 font-normal w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-900">
                            {reservas && reservas.length > 0 ? (
                                reservas.slice(0, 4).map((reserva) => (
                                    <tr
                                        key={reserva.id}
                                        className="group border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 font-medium">
                                            {reserva.dataInicio ? new Date(reserva.dataInicio).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td className="py-3 text-gray-600">
                                            {formatarHorario(reserva.dataInicio, reserva.dataFim)}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-blue-900">
                                                    {reserva.Evento?.nome || reserva.motivo || "Reserva Avulsa"}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    ID: #{reserva.id}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-600">
                                            {reserva.Solicitacao?.dadosSolicitante || "Não informado"}
                                        </td>
                                        <td className="py-3 text-right">
                                            <Link
                                                href={`/reservas/${reserva.id}`}
                                                className="inline-flex items-center justify-center p-2 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-700 transition-all"
                                                title="Ver Detalhes da Reserva"
                                            >
                                                <Search size={18} strokeWidth={1.5} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                                        Nenhuma reserva futura encontrada para este espaço.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Link "Ver Mais" Dinâmico e Seguro */}
                    {totalReservas > 5 && espacoId && (
                        <div className="flex justify-end mt-4 border-t pt-4">
                            <Link
                                href={`/reservas/buscar?idEspaco=${espacoId}&dataInicio=${new Date().toISOString().split('T')[0]}`}
                                className="text-sm font-bold hover:underline transition-colors"
                                style={{ color: "#00247D" }}
                            >
                                Ver histórico completo de reservas →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}