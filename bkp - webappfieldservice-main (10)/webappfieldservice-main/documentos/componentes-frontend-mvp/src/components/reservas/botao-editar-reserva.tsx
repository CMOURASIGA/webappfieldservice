import Link from "next/link";
import IconEdit from "@/icons/edit";

interface BotaoEditarReservaProps {
    idReserva: number;
}

export function BotaoEditarReserva({ idReserva }: BotaoEditarReservaProps) {
    return (
        <Link
            href={`/espacos/reservas/editar/${idReserva}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
            <IconEdit className="w-4 h-4" />
            Editar Reserva
        </Link>
    );
}
