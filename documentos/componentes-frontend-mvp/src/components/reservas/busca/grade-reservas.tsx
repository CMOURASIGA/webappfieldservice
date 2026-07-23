"use client";

import { Reserva } from "@/services/reservas/tipo-reserva";
import { Skeleton } from "@/components/ui/skeleton";
import { CardReserva } from "../card-reserva";

type Props = {
    itens: Reserva[];
    onDeleteClick?: (reserva: Reserva) => void;
    onSelect?: (reserva: Reserva) => void;
    onDeselect?: (reserva: Reserva) => void;
    selectedIds?: number[]; // Changed to array
    loading?: boolean;
    readOnly?: boolean;
    isSelectionGrid?: boolean; // New prop to optionally change styling
};

export function GradeReservas({ itens, onDeleteClick, onSelect, onDeselect, selectedIds = [], loading, readOnly, isSelectionGrid }: Props) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border shadow-sm h-[280px] p-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="space-y-2 pt-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4 justify-between border-t mt-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itens && itens.length > 0 && itens.map((r) => {
                const isSelected = selectedIds.includes(r.id);

                return (
                    <CardReserva
                        key={r.id}
                        reserva={r}
                        onDeleteClick={onDeleteClick}
                        onSelect={onSelect}
                        onDeselect={onDeselect}
                        isSelected={isSelected}
                        readOnly={readOnly}
                        isSelectionGrid={isSelectionGrid}
                    />
                );
            })}
        </div>
    );
}
