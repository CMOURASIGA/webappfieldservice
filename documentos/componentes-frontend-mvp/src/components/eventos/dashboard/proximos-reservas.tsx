import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Badge,
    Card,
    CardContent,
    CardHeader,
} from "@cnc-ti/layout-basic";
import { Search } from "lucide-react";
import { Reserva } from "@/services/reservas/tipo-reserva";

export interface EventoSimples {
    id: number;
    nome: string;
    descricao: string;
    dataInicio: string;
    dataFim: string;
    estado: string;
    status: string;
    pais: string
}
export interface ReservasSimples {
    id: number;
    Solicitacao: {
        id: number;
        demandante: string;
        descricao: string;
    }
    Evento: EventoSimples;
    dataInicio: string;
    dataFim: string;
    motivo: string;
}

interface ProximosEspacosProps {
    reservas?: Reserva[];
    className?: string;
    loading?: boolean;
}
const statusVariantMap: Record<string, "success" | "danger" | "warning" | "default"> = {
    Concluido: "success",  // Use o valor técnico (minúsculo/sem acento)
    Cancelado: "danger",
    Execucao: "warning",
    Planejado: "danger", // ou "primary"
};

const SkeletonLoader = () => (
    <>
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 justify-between animate-pulse">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
        ))}
    </>
);

export function ProximasReservas({ reservas, className, loading = false }: ProximosEspacosProps) {
    // Pega apenas os 4 primeiros espacos, conforme o design
    const displayEvents = Array.isArray(reservas) ? reservas.slice(0, 4) : [];

    return (

        <Card className={cn("border border-gray rounded-none shadow-none mt-2", className)}>
            <CardHeader className="flex flex-row items-center justify-between py-4 px-4 space-y-0">
                Mostrando as próximas {displayEvents.length} reservas
                <Link
                    style={{ textDecoration: "underline", color: "rgba(0, 36, 125, var(--tw-bg-opacity, 1))" }}
                    href={`/espacos/reservas/buscar?dataInicio=${new Date().toLocaleDateString('en-CA')}`}
                    className="text-sm font-medium text-red-500 hover:underline"
                >
                    Ver todas
                </Link>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2 grid gap-4 w-full">
                {loading ? (
                    <SkeletonLoader />
                ) : displayEvents.length > 0 ? (
                    displayEvents.map((reserva) => {

                        const day = reserva.dataInicio.substring(0, 2)
                        const month = (new Date(reserva.dataInicio).getMonth() + 1).toString().padStart(2, '0');
                        const year = new Date(reserva.dataInicio).getFullYear();

                        return (
                            <div key={reserva.id} className="flex items-center gap-4 justify-between">
                                <div className="flex justify-between">

                                    <Badge
                                        variant={"default"}
                                    >
                                        {day}/{month}/{year}
                                    </Badge>
                                    <span className="mx-2 text-base font-medium text-black line-clamp-1">
                                        {reserva.Espaco?.Local?.nome && `${reserva.Espaco.Local.nome} - `}
                                        {reserva.Espaco?.nome && `${reserva.Espaco.nome} - `}
                                        {reserva.motivo}
                                    </span>
                                </div>
                                <Link
                                    href={`/reservas/${reserva.id}`}
                                    className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-all"
                                    title="Ver detalhes"
                                >
                                    <Search size={18} strokeWidth={1.25} />
                                </Link>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Nenhuma proxima reserva.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}