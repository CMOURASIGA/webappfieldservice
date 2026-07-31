import { Espaco } from "@/services/espacos/tipo-espaco";
import { Badge, Button } from "@cnc-ti/layout-basic";
import { Users, LayoutGrid, MapPin } from "lucide-react";
import { FiltrosNovaReserva } from "./campos-filtro-nova-reserva";
import { useState } from "react";
import { ModalHorariosNovaReserva } from "./modal-horarios";
import { useQuery } from "@tanstack/react-query";
import { getReservas } from "@/services/reservas/reserva.service";
import { format, parse, addMinutes, isBefore, isAfter } from "date-fns";

function calcularTemHorario(
    reservas: any[],
    filtros: FiltrosNovaReserva,
    dataStr: string,
): boolean {
    const baseDate = parse(dataStr, 'yyyy-MM-dd', new Date());
    let startTime = parse(filtros.horaInicial || "07:30", 'HH:mm', baseDate);
    const endTime = parse(filtros.horaFinal || "21:30", 'HH:mm', baseDate);
    const now = new Date();

    const toLocal = (iso: string) =>
        new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

    while (!isAfter(startTime, endTime)) {
        const nextTime = addMinutes(startTime, 30);

        if (!isBefore(startTime, now)) {
            const isOccupied = reservas.some((r: any) =>
                !isAfter(startTime, toLocal(r.dataFim)) && isAfter(nextTime, toLocal(r.dataInicio))
            );
            if (!isOccupied) return true;
        }

        startTime = nextTime;
    }

    return false;
}

function EspacoCard({
    espaco,
    filtros,
    onOpenModal,
}: {
    espaco: Espaco;
    filtros: FiltrosNovaReserva;
    onOpenModal: (e: Espaco) => void;
}) {
    const dataStr = filtros.dataInicial || format(new Date(), 'yyyy-MM-dd');

    const { data: reservas = [], isLoading } = useQuery({
        queryKey: ["reservasEspaco", espaco.Id, dataStr],
        queryFn: async () =>
            getReservas({ idEspaco: String(espaco.Id), dataInicio: dataStr, dataFim: dataStr }),
        staleTime: 0,
        refetchOnMount: true,
        enabled: espaco.ativo,
    });

    const temHorario = calcularTemHorario(reservas, filtros, dataStr);

    if (!isLoading && !temHorario) return null;

    return (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{espaco.nome}</h3>
                    <Badge variant={espaco.ativo ? "info" : "danger"}>
                        {espaco.ativo ? "Disponível" : "Indisponível"}
                    </Badge>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {espaco.Local?.nome || "Local não informado"}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        <Users className="w-4 h-4 mr-2" />
                        Capacidade: {espaco.capacidade} pessoas
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Status: {espaco.ativo ? "Livre para reserva" : "Ocupado"}
                    </div>
                </div>

                <Button
                    className="w-full bg-[#004A8D] hover:bg-[#003566]"
                    disabled={!espaco.ativo}
                    onClick={() => onOpenModal(espaco)}
                    title={!espaco.ativo ? "Espaço indisponível" : undefined}
                >
                    Verificar Horários
                </Button>
            </div>
        </div>
    );
}

export type GradeDisponibilidadeProps = {
    itens: Espaco[];
    filtros: FiltrosNovaReserva;
    loading: boolean;
}

export function GradeDisponibilidade({ itens, filtros }: GradeDisponibilidadeProps) {
    const [selectedEspaco, setSelectedEspaco] = useState<Espaco | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = (espaco: Espaco) => {
        setSelectedEspaco(espaco);
        setIsModalOpen(true);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itens && itens.length > 0 && itens.map((espaco, i) => (
                <EspacoCard
                    key={i}
                    espaco={espaco}
                    filtros={filtros}
                    onOpenModal={handleOpenModal}
                />
            ))}

            <ModalHorariosNovaReserva
                espaco={selectedEspaco}
                filtros={filtros}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
