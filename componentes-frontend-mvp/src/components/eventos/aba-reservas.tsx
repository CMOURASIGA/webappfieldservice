"use client";

import useReservas from "@/hooks/reservas/use-reservas";
import CamposBuscaReservas from "../reservas/busca/campos-busca-reservas";
import { GradeReservas } from "../reservas/busca/grade-reservas";
import { Reserva } from "@/services/reservas/tipo-reserva";

import {
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@cnc-ti/layout-basic";
import { useState } from "react";
import { FormularioReservas } from "@/components/reservas/formulario-reservas";
import { createReservaAction } from "@/app/(private)/reservas/action";

interface AbaReservasProps {
    onSelectReserva: (reserva: Reserva) => void;
    onDeselectReserva?: (reserva: Reserva) => void;
    selectedReservas?: Reserva[]; // Now array
    readOnly?: boolean;
    espacos: any[]; // Was { label: string; value: string }[], now receiving full objects
    locais?: { label: string; value: string }[];
    eventos: { label: string; value: string }[];
    eventoId?: number;
    initialEspacoId?: string | number;
}

export function AbaReservas({ onSelectReserva, onDeselectReserva, selectedReservas = [], readOnly, espacos, locais, eventos, eventoId, initialEspacoId }: AbaReservasProps) {
    const { reservas, isFetching, executarBusca, filtros, refetch } = useReservas({
        initialFilters: {
            dataInicio: undefined,
            dataFim: undefined,
            disponiveis: true,
            idEspaco: initialEspacoId ? Number(initialEspacoId) : undefined
        },
        skipUrlUpdate: true // Prevent URL navigation when used in form context
    });

    const [open, setOpen] = useState(false);

    async function handleCreateSubmit(data: any) {
        const res = await createReservaAction(data);
        if (res.success && res.data) {
            onSelectReserva(res.data);
        }
        setOpen(false);
        if (refetch) refetch();
    }

    return (
        <div className="space-y-6">

            {/* --- GRID DE SELECIONADAS --- */}
            {selectedReservas.length > 0 && (
                <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-blue-900 uppercase flex items-center gap-2">
                            <span className="bg-blue-200 text-blue-700 px-2 py-0.5 rounded text-xs">{selectedReservas.length}</span>
                            Reservas Selecionadas
                        </h3>
                        {!readOnly && (
                            <Dialog open={open} onOpenChange={setOpen} modal={false}>
                                <DialogTrigger asChild>
                                    <Button variant="create" type="button">Nova Reserva</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                                    <DialogHeader>
                                        <DialogTitle>Nova Reserva</DialogTitle>
                                    </DialogHeader>
                                    <FormularioReservas
                                        espacos={espacos}
                                        locais={locais}
                                        eventos={eventos}
                                        onSubmit={handleCreateSubmit}
                                        redirectOnSuccess={false}
                                        initialData={{
                                            idEvento: eventoId,
                                            // Optional: Pre-fill data if needed
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <GradeReservas
                        itens={selectedReservas}
                        loading={false}
                        onSelect={() => { }} // No 'select' allowed here, only deselect
                        onDeselect={onDeselectReserva} // Allow removing
                        selectedIds={selectedReservas.map(r => r.id)}
                        readOnly={readOnly}
                        isSelectionGrid={true} // Hint for styling if needed
                    />
                </div>
            )}

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-700 uppercase">Filtrar Reservas Disponíveis</h3>
                    {!readOnly && selectedReservas.length === 0 && (
                        <Dialog open={open} onOpenChange={setOpen} modal={false}>
                            <DialogTrigger asChild>
                                <Button variant="create" type="button">Nova Reserva</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                                <DialogHeader>
                                    <DialogTitle>Nova Reserva</DialogTitle>
                                </DialogHeader>
                                <FormularioReservas
                                    espacos={espacos}
                                    locais={locais}
                                    eventos={eventos}
                                    onSubmit={handleCreateSubmit}
                                    redirectOnSuccess={false}
                                    initialData={{
                                        idEvento: eventoId,
                                        // Optional: Pre-fill data if needed
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
                <CamposBuscaReservas filtros={filtros} loading={isFetching} enviarFiltros={executarBusca} hideEvento={true} />
            </div>

            <div>
                <div className="text-sm text-gray-500 mb-2">
                    {reservas.length > 0 ? (
                        <span>Encontramos <strong>{reservas.length}</strong> reservas disponíveis.</span>
                    ) : (
                        <span>Nenhuma reserva encontrada com os filtros atuais.</span>
                    )}
                </div>

                <GradeReservas
                    itens={reservas.filter(r => !selectedReservas.some(selected => selected.id === r.id))}
                    loading={isFetching}
                    onSelect={onSelectReserva}
                    onDeselect={onDeselectReserva}
                    selectedIds={selectedReservas.map(r => r.id)}
                    readOnly={readOnly}
                />
            </div>
        </div>
    );
}
