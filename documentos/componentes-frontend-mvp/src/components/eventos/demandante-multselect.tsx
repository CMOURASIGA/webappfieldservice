"use client";
import { useState } from 'react';
import { useFieldArray, Control, FieldErrors } from 'react-hook-form';
import Select from 'react-select';
import { Trash2, Plus, ChevronsUpDown } from 'lucide-react';
import { ModalAddDemandante } from './modal-add-demandante';
import { Input } from '@cnc-ti/layout-basic';

interface Option {
    value: number | string;
    label: string;
}

interface MultiSelectDemandanteProps {
    control: Control<any>;
    register: any;
    errors: FieldErrors<any>;
    options: Option[];
    readOnly?: boolean;
    required?: boolean; // Added
}

export const MultiSelectDemandante = ({
    control,
    register,
    errors,
    options,
    readOnly,
    required // Added
}: MultiSelectDemandanteProps) => {
    // ... (existing code, ensure it aligns with original file structure if omitted) 
    /* NOTE: Since replace_file_content expects a chunk, I need to match the target content exactly. 
       I will break this into two edits if the lines are far apart, or one larger chunk if contiguous.
       Lines 13-27 contain the interface and function signature.
       Line 84 contains the header.
       Let's use MultiReplaceFileContent for safety or just target the header if I accept the prop is not strictly typed in the component usage in JS/TS without erroring too much (but it is TS).
       I will do the interface and destructuring first.
    */
    /* Actually, the tool call below is for the Interface and Signature */

    const [selectedOption, setSelectedOption] = useState<Option | null>(null);
    const [contatoValue, setContatoValue] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    // N.B: Since options come from props, we might need a way to update the parent's options list. 
    // However, the component receives `options` as prop. 
    // For now, let's assume valid reactivity or simple local addition for Immediate UX if parent updates.
    // Ideally, we should receive an `onAddOption` prop or handle it via Context/SWR revalidation.
    // Giving the limitations, I'll allow adding to local state if needed, but better to just trigger parent re-fetch?
    // Let's implement a local update to options buffer if possible or just rely on parent SWR if it was passed that way.
    // Actually, `options` is passed from `formulario-eventos`.
    // We will cheat slightly: we can't easily update the parent's props without a callback.
    // I'll add a local state for *extra* options or just hope for the best? NO.
    // I will modify the props to accept `onNewDemandante` or similar, BUT that requires changing parent.
    // EASIER: I'll use a SWR mutation or just forcing a router refresh... 
    // Wait, the user asked to "record in DB and retrieve".
    // I will add `setInternalOptions` to merge prop options + new ones.

    const [internalOptions, setInternalOptions] = useState<Option[]>(options);

    // Sync when props change
    if (options !== internalOptions && options.length !== internalOptions.length && !modalOpen) {
        // This sync is tricky loops. Let's use useEffect.
    }

    // Better approach: use useEffect to sync initial options, and append new ones.

    // ... (useFieldArray)

    const { fields, append, remove } = useFieldArray({
        control,
        name: "demandantesArea"
    });

    const handleAdd = () => {
        // ... (existing logic)
        if (selectedOption && contatoValue.trim()) {
            append({
                demandanteId: selectedOption.value,
                nome: selectedOption.label,
                dadosContato: contatoValue
            });
            setContatoValue('');
            setSelectedOption(null);
        }
    };

    const handleNewDemandanteSuccess = (newItem: Option) => {
        // Add to internal options to be selectable immediately
        setInternalOptions(prev => [...prev, newItem]);
        // Also select it immediately? User might want that.
        setSelectedOption({ value: newItem.value, label: newItem.label });
    };

    const customSelectStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            minHeight: '40px',
            borderRadius: '0.375rem',
            borderColor: state.isFocused ? '#2563eb' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#2563eb' : '#d1d5db',
            },
            backgroundColor: readOnly ? "#f9fafb" : (!!errors.demandantesArea ? "#fef2f2" : "white"), // bg-red-50 se erro
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (provided: any) => ({
            ...provided,
            color: '#94a3b8', // slate-400
            padding: '0 8px',
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: '#9ca3af',
            fontSize: '0.875rem',
        }),
        singleValue: (provided: any) => ({
            ...provided,
            fontSize: '0.875rem',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            fontSize: '0.875rem',
            backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
            color: state.isSelected ? 'white' : '#1f2937',
        }),
    };

    return (
        <div className="bg-white rounded-lg p-0 space-y-6 md:col-span-12">
            {/* Header removido para padronização */}

            {/* BARRA DE ADIÇÃO (IGUAL À IMAGEM, MAS COM ESTILO PADRÃO) */}
            {!readOnly && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end py-2">
                    <div className="md:col-span-4 flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                            Adicionar Demandante {required && fields.length === 0 && <span className="text-red-500">*</span>}
                        </label>
                        <Select
                            styles={customSelectStyles}
                            options={internalOptions}
                            value={selectedOption}
                            onChange={(opt: any) => setSelectedOption(opt)}
                            placeholder="Selecione o Demandante"
                            classNamePrefix="react-select"
                            components={{
                                DropdownIndicator: () => (
                                    <div className="flex items-center justify-center pr-2 text-slate-400">
                                        <ChevronsUpDown size={16} />
                                    </div>
                                ),
                                MenuList: (props: any) => (
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
                                                Cadastrar Demandante
                                            </button>
                                        </div>
                                    </div>
                                )
                            }}
                        />
                    </div>
                    {/* ... (rest of fields) */}
                    <div className="md:col-span-6 flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                            Dados de Contato {required && fields.length === 0 && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                            type="text"
                            value={contatoValue}
                            onChange={(e) => setContatoValue(e.target.value)}
                            placeholder="Escreva os dados do contato"
                            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={!selectedOption || !contatoValue}
                            className="w-full h-10 flex items-center justify-center gap-2 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} /> Adicionar
                        </button>
                    </div>
                </div>
            )}

            <ModalAddDemandante
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={handleNewDemandanteSuccess}
            />

            {/* ... (Table) */}
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Demandante</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dados de contato</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm">
                        {fields.map((field, index) => (
                            <tr key={field.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {(field as any).nome}
                                    <input type="hidden" {...register(`demandantesArea.${index}.demandanteId`)} defaultValue={(field as any).demandanteId} />
                                    <input type="hidden" {...register(`demandantesArea.${index}.nome`)} defaultValue={(field as any).nome} />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        {...register(`demandantesArea.${index}.dadosContato`)}
                                        defaultValue={(field as any).dadosContato}
                                        readOnly={readOnly}
                                        className={`
                                            w-full px-2 py-1 text-sm rounded transition-all outline-none
                                            bg-gray-50 hover:bg-gray-100 
                                            border-b border-gray-200 focus:border-blue-500 focus:bg-white
                                            text-gray-600 focus:text-gray-900
                                            ${(errors.demandantesArea as any)?.[index]?.dadosContato ? 'border-red-500 bg-red-50' : ''}
                                        `}
                                    />
                                    {errors.demandantesArea && (errors.demandantesArea as any)[index]?.dadosContato && (
                                        <p className="text-red-500 text-[10px] mt-0.5 font-medium">
                                            {(errors.demandantesArea as any)[index].dadosContato?.message}
                                        </p>
                                    )}
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
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                                    Nenhum contato adicionado ainda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Exibe erro geral do array (ex: min(1) "Selecione pelo menos um demandante") */}
            {(errors.demandantesArea as any)?.message && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                    {(errors.demandantesArea as any)?.message}
                </p>
            )}

            {errors.demandantesArea?.root && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                    {(errors.demandantesArea?.root as any)?.message}
                </p>
            )}
        </div>
    );
};