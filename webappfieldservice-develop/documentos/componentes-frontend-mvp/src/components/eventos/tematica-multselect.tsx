"use client";
import { useState } from "react";
import Select from "react-select";
import { ChevronsUpDown } from "lucide-react";
import { ModalAddTematica } from "./modal-add-tematica";
import { Controller, useFormContext } from "react-hook-form";

interface Option {
    value: number | string;
    label: string;
}

interface MultiSelectTematicaProps {
    control: any;
    name: string; // nome do campo no form (ex: 'idsTematicas')
    options: Option[];
    initialOptions?: Option[];
    readOnly?: boolean;
    required?: boolean;
    error?: string;
}

export const MultiSelectTematica = ({
    control,
    name,
    options,
    initialOptions = [],
    readOnly,
    required,
    error,
}: MultiSelectTematicaProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [locallyAddedOptions, setLocallyAddedOptions] = useState<Option[]>([]);

    // Combine options from props (server) and locally added ones
    // Use a Map to ensure uniqueness by value
    const mergedOptions = [...initialOptions, ...options, ...locallyAddedOptions].reduce((acc, current) => {
        const x = acc.find(item => String(item.value) === String(current.value));
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, [] as Option[]);

    const { setValue, getValues } = useFormContext(); // Pegar contexto do formulário

    const handleNewTematicaSuccess = (newItem: Option) => {
        setLocallyAddedOptions((prev) => [...prev, newItem]);

        // Selecionar automaticamente a nova temática
        const currentValues = getValues(name) || [];
        const newValues = Array.isArray(currentValues)
            ? [...currentValues, Number(newItem.value)]
            : [Number(newItem.value)];

        setValue(name, newValues, { shouldDirty: true, shouldValidate: true });
    };

    const customSelectStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            minHeight: "40px",
            borderRadius: "0.375rem",
            borderColor: state.isFocused ? "#2563eb" : !!error ? "#ef4444" : "#d1d5db",
            boxShadow: state.isFocused
                ? "0 0 0 1px #2563eb"
                : !!error
                    ? "0 0 0 1px #ef4444"
                    : "none",
            "&:hover": {
                borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
            },
            backgroundColor: readOnly ? "#f9fafb" : (!!error ? "#fef2f2" : "white"), // bg-red-50 se erro
        }),
        indicatorSeparator: () => ({
            display: "none",
        }),
        dropdownIndicator: (provided: any) => ({
            ...provided,
            color: "#94a3b8",
            padding: "0 8px",
        }),
        menu: (provided: any) => ({
            ...provided,
            zIndex: 9999
        })
    };

    return (
        <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${error ? "text-red-500" : "text-gray-600"}`}>
                Temática {required && <span className="text-red-500">*</span>}
            </label>

            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <Select
                        {...field}
                        isMulti
                        isDisabled={readOnly}
                        styles={customSelectStyles}
                        options={mergedOptions}
                        // Mapear value (array de IDs) para objetos Option
                        value={mergedOptions.filter(opt =>
                            Array.isArray(field.value) ? field.value.includes(Number(opt.value)) : field.value === Number(opt.value)
                        )}
                        onChange={(selectedOptions: any) => {
                            // Mapear volta para array de IDs
                            const ids = selectedOptions.map((opt: any) => Number(opt.value));
                            field.onChange(ids);
                        }}
                        placeholder="Selecione as temáticas..."
                        classNamePrefix="react-select"
                        components={{
                            DropdownIndicator: () => (
                                <div className="flex items-center justify-center pr-2 text-slate-400">
                                    <ChevronsUpDown size={16} />
                                </div>
                            ),
                            MenuList: (props: any) => (
                                <div>
                                    <div
                                        {...props.innerProps}
                                        style={{ maxHeight: "200px", overflowY: "auto" }}
                                    >
                                        {props.children}
                                    </div>
                                    {!readOnly && (
                                        <div style={{ borderTop: "1px solid #e5e7eb", padding: "8px" }}>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault(); // Importante para não fechar o select as vezes
                                                    setModalOpen(true);
                                                }}
                                                className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors text-sm"
                                            >
                                                Cadastrar Nova Temática
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ),
                        }}
                    />
                )}
            />

            {error && (
                <span className="text-xs text-red-500 font-medium">
                    {error}
                </span>
            )}

            <ModalAddTematica
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={handleNewTematicaSuccess}
            />
        </div>
    );
};
