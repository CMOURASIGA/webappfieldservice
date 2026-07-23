"use client"
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventoSimples } from "./dashboard/proximos-eventos";
import { EventoSimilar } from "@/app/(private)/eventos/eventoDTO"

interface ListaEventosSimilaresProps {
    title: string;
    events: EventoSimilar[];
    className?: string;
}
const handlerDemandante = (evento: any) => {
    if (!evento.DemandanteEvento || evento.DemandanteEvento.length === 0) {
        return <span className="text-gray-400 italic font-normal">Não informado</span>;
    }
    const demandante = evento.DemandanteEvento.at(0)?.Demandante;
    return demandante?.Entidade?.nome ? `${demandante.nome} - ${demandante.Entidade.nome}` : (demandante?.nome ?? 'Sem Nome');
};
export function ListaEventosSimilares({ title, events, className }: ListaEventosSimilaresProps) {
    return (
        <div className={cn("border border-gray-100 bg-white", className)}>

            <div className="p-4 md:px-6 py-4 border-gray-200">
                <h3 className="font-bold text-lg text-gray-900">
                    {title}
                </h3>
            </div>

            <div className="p-4 md:px-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-sm text-gray-500 border-b border-transparent">
                                <th className="pb-3 font-normal w-1/4">Evento</th>
                                <th className="pb-3 font-normal w-20">Data</th>
                                <th className="pb-3 font-normal w-32">Demandante</th>
                                <th className="pb-3 font-normal w-1/4">Local</th>
                                <th className="pb-3 font-normal w-1/4">Responsável</th>
                                <th className="pb-3 font-normal w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-900">
                            {events && events.length > 0 ? (
                                events.slice(0, 5).map((event) => (
                                    <tr
                                        key={event.id}
                                        className="group border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 font-medium align-middle">{event.nome}</td>
                                        <td className="py-3 align-middle">{event.dataInicio ? new Date(event.dataInicio).toLocaleDateString('pt-BR') : '-'}</td>
                                        <td className="py-3 align-middle">{handlerDemandante(event)}</td>
                                        <td className="py-3 align-middle text-gray-600">{event.estado}</td>
                                        <td className="py-3 align-middle text-gray-600">{event.nomeProdutor}</td>
                                        <td className="py-3 align-middle text-right">
                                            <Link
                                                href={`/eventos/detalhes/${event.id}`}
                                                className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-all"
                                                title="Ver detalhes"
                                            >
                                                <Search size={18} strokeWidth={1.25} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-gray-400 italic">
                                        Nenhum evento similar encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {events && events.length > 5 && <div className="flex justify-end" style={{ textDecoration: "underline", color: "rgba(0, 36, 125, var(--tw-bg-opacity, 1))" }}> <Link href={'/eventos/buscar'} >Ver Mais</Link></div>}
                </div>
            </div>
        </div >
    );
}
