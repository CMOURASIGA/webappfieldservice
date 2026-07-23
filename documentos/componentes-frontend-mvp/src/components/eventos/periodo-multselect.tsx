"use client";
import { useState } from 'react';
import { useFieldArray, Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Trash2, Plus } from 'lucide-react';
import { Input } from '@cnc-ti/layout-basic';

interface MultiSelectPeriodoProps {
    control: Control<any>;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    readOnly?: boolean;
    required?: boolean;
}

export const MultiSelectPeriodo = ({
    control,
    register,
    errors,
    readOnly,
    required
}: MultiSelectPeriodoProps) => {
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    const { fields, append, remove } = useFieldArray({
        control,
        name: "periodos"
    });

    const handleAdd = () => {
        if (dataInicio && dataFim) {
            // Combinar data e hora para criar dataInicio e dataFim ISO
            const dataInicioIso = new Date(`${dataInicio}:00-03:00`).toISOString();
            const dataFimIso = new Date(`${dataFim}:00-03:00`).toISOString();

            append({
                dataInicio: dataInicioIso,
                dataFim: dataFimIso
            });
            setDataInicio('');
            setDataFim('');
        }
    };

    const formatDateTimeLocal = (isoString: string | undefined): string | undefined => {
        if (!isoString) return undefined;
        const dateObj = new Date(isoString);
        // Subtrai 3 horas para igualar à lógica do `formatDateTime` do formulário principal
        const adjustedDate = new Date(dateObj.getTime() - 3 * 60 * 60 * 1000);
        return adjustedDate.toISOString().slice(0, 16);
    };

    const formatDateForDisplay = (isoString: string) => {
        const formatted = formatDateTimeLocal(isoString);
        if (!formatted) return '';
        const [datePart] = formatted.split('T');
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
    };

    const formatTimeForDisplay = (isoString: string) => {
        const formatted = formatDateTimeLocal(isoString);
        if (!formatted) return '';
        const parts = formatted.split('T');
        return parts[1];
    };

    const isDuplicate = fields.some((field: any) => {
        if (!dataInicio || !dataFim) return false;
        const fieldDataInicio = new Date(field.dataInicio).toISOString();
        const fieldDataFim = new Date(field.dataFim).toISOString();
        const newDataInicio = new Date(`${dataInicio}:00-03:00`).toISOString();
        const newDataFim = new Date(`${dataFim}:00-03:00`).toISOString();
        return fieldDataInicio === newDataInicio && fieldDataFim === newDataFim;
    });

    const isInvalidDates = dataInicio && dataFim ? new Date(`${dataInicio}:00-03:00`) >= new Date(`${dataFim}:00-03:00`) : false;
    const minDataFim = dataInicio || undefined;

    return (
        <div className="bg-white rounded-lg p-0 space-y-6 md:col-span-12">
            {!readOnly && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end py-2">
                    <div className="md:col-span-5 flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                            Início {required && fields.length === 0 && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                            type="datetime-local"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                    </div>
                    <div className="md:col-span-5 flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                            Fim {required && fields.length === 0 && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                            type="datetime-local"
                            value={dataFim}
                            min={minDataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={!dataInicio || !dataFim || isDuplicate || isInvalidDates}
                            className="w-full h-10 flex items-center justify-center gap-2 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isDuplicate ? 'Este período já foi adicionado' : isInvalidDates ? 'A data final deve ser posterior à data inicial' : ''}
                        >
                            <Plus size={16} /> Adicionar
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Início</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fim</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm">
                        {fields.map((field: any, index) => (
                            <tr key={field.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 text-gray-900">
                                    <span className="font-medium">{formatDateForDisplay(field.dataInicio)}</span>
                                    <span className="ml-2 text-gray-500">{formatTimeForDisplay(field.dataInicio)}</span>
                                    <input type="hidden" {...register(`periodos.${index}.dataInicio`)} defaultValue={field.dataInicio} />
                                </td>
                                <td className="px-6 py-4 text-gray-900">
                                    <span className="font-medium">{formatDateForDisplay(field.dataFim)}</span>
                                    <span className="ml-2 text-gray-500">{formatTimeForDisplay(field.dataFim)}</span>
                                    <input type="hidden" {...register(`periodos.${index}.dataFim`)} defaultValue={field.dataFim} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {fields.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                                    Nenhuma data adicionada ainda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Exibe erro geral do array */}
            {(errors.periodos as any)?.message && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                    {(errors.periodos as any)?.message}
                </p>
            )}

            {errors.periodos?.root && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                    {(errors.periodos?.root as any)?.message}
                </p>
            )}
        </div>
    );
};
