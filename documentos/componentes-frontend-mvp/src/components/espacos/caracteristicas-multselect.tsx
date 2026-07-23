"use client"
import { useState } from 'react';
import { useFieldArray, Control, FieldErrors } from 'react-hook-form';
import Select from 'react-select';
import { Trash2, Plus, ChevronsUpDown } from 'lucide-react';
import { ModalAddCaracteristica, FormNovaCaracteristicaData } from './modal-add-caracteristica';

interface Option {
    value: string | number;
    label: string;
}

interface MultiSelectCaracteristicasProps {
    control: Control<any>;
    register: any;
    errors: FieldErrors<any>;
    options: Option[]; // Características vindas do backend
    readOnly?: boolean;
}

export const MultiSelectCaracteristicas = ({
    control,
    register,
    errors,
    options,
    readOnly
}: MultiSelectCaracteristicasProps) => {
    // Estado para o Select (existentes) e para o Input (novas)
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);
    const [novaValue, setNovaValue] = useState<Option & { observacao: string }>({ value: '', label: '', observacao: '' });
    const [modalOpen, setModalOpen] = useState(false);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "caracteristicasArray"
    });

    const handleAdd = () => {
        if (selectedOption) {
            const observacaoNormalizada = novaValue.observacao?.trim() || "-";
            const caracteristicaId =
                typeof selectedOption.value === "string"
                    ? Number(selectedOption.value)
                    : selectedOption.value;
            append({
                caracteristicaId: Number.isNaN(caracteristicaId) ? 0 : caracteristicaId,
                nome: selectedOption.label,
                observacao: observacaoNormalizada
            });
            setNovaValue({ value: '', label: '', observacao: '' });
            setSelectedOption(null);
        }
    };

    const handleNewCaracteristicaSuccess = (data: FormNovaCaracteristicaData & { id?: number }) => {
        if (data.id) {
            setSelectedOption({
                value: data.id,
                label: data.nome
            });
            // Automatically focuses behavior to the observacao input if needed, but for now just selecting is fine
        }
    };

    const MenuList = (props: any) => {
        return (
            <div>
                <div {...props.innerProps} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {props.children}
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', padding: '8px' }}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setModalOpen(true);
                        }}
                        className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors text-sm"
                    >
                        Cadastrar Característica
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg p-4 space-y-6 md:col-span-12 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#1e3a8a] mb-2 uppercase tracking-wide">Características</h2>

            {!readOnly && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                    <div className="md:col-span-5">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Selecionar Existente</label>
                        <Select
                            options={options}
                            value={selectedOption}
                            onChange={(opt: any) => setSelectedOption(opt)}
                            placeholder="Selecione a Característica"
                            classNamePrefix="react-select"
                            components={{
                                DropdownIndicator: () => (
                                    <div className="flex items-center justify-center pr-2 text-slate-400">
                                        <ChevronsUpDown size={16} />
                                    </div>
                                ),
                                MenuList: MenuList
                            }}
                        />
                    </div>

                    <div className="md:col-span-5 flex flex-col gap-1.5">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Observação</label>
                        <input
                            type="text"
                            value={novaValue.observacao}
                            onChange={(e) => setNovaValue({ ...novaValue, observacao: e.target.value })}
                            placeholder="Ex: 7.000 BTUs"
                            className="w-full h-[38px] px-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={!selectedOption}
                            className="w-full h-10 flex items-center justify-center gap-2 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} /> Adicionar
                        </button>
                    </div>
                </div>
            )}

            <ModalAddCaracteristica
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={handleNewCaracteristicaSuccess}
            />

            {/* TABELA DE LISTAGEM */}
            <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Característica</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Observação</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Origem</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-widest">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm">
                        {fields.map((field: any, index) => (
                            <tr key={field.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-700">
                                    {field.nome}
                                    <input type="hidden" {...register(`caracteristicasArray.${index}.caracteristicaId`)} />
                                    <input type="hidden" {...register(`caracteristicasArray.${index}.nome`)} />
                                    <input type="hidden" {...register(`caracteristicasArray.${index}.observacao`)} />
                                </td>
                                <td className="px-6 py-4">
                                    {field.observacao || "-"}
                                </td>
                                <td className="px-6 py-4">
                                    {field.caracteristicaId ? (
                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">EXISTENTE</span>
                                    ) : (
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">NOVO</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {fields.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                                    Nenhuma característica vinculada a este espaço.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {errors.caracteristicasArray?.root?.message && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                    {String(errors.caracteristicasArray.root.message)}
                </p>
            )}
        </div>
    );
};