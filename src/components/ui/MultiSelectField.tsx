import React, { useMemo, useState } from "react";
import ReactSelect, { SingleValue, StylesConfig } from "react-select";
import { Plus, X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../utils/cn";

export type MultiSelectOption = {
  value: string;
  label: string;
};

interface MultiSelectFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  addButtonLabel?: string;
}

const selectStyles: StylesConfig<MultiSelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderWidth: 2,
    borderColor: state.isFocused ? "#1246a0" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(18, 70, 160, 0.15)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#1246a0" : "#94a3b8",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#f4f7fd" : "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 20,
  }),
};

export const MultiSelectField = ({
  label,
  error,
  helperText,
  options,
  value,
  onChange,
  disabled = false,
  className,
  emptyMessage = "Nenhum item selecionado.",
  searchPlaceholder = "Pesquise e selecione...",
  addButtonLabel = "Adicionar",
}: MultiSelectFieldProps) => {
  const [pendingOption, setPendingOption] = useState<MultiSelectOption | null>(null);

  const selectedOptions = useMemo(
    () => value.map((selectedValue) => options.find((option) => option.value === selectedValue)).filter(Boolean) as MultiSelectOption[],
    [options, value]
  );

  const availableOptions = useMemo(
    () => options.filter((option) => !value.includes(option.value)),
    [options, value]
  );

  const handleAdd = () => {
    if (!pendingOption || disabled) return;
    onChange([...value, pendingOption.value]);
    setPendingOption(null);
  };

  const handleRemove = (optionValue: string) => {
    if (disabled) return;
    onChange(value.filter((item) => item !== optionValue));
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-[13px] font-semibold text-slate-700">{label}</label>}
      <div className={cn("space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4", disabled && "opacity-70")}>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_160px]">
          <ReactSelect
            value={pendingOption}
            onChange={(option: SingleValue<MultiSelectOption>) => setPendingOption(option)}
            options={availableOptions}
            isDisabled={disabled || availableOptions.length === 0}
            isSearchable
            placeholder={searchPlaceholder}
            noOptionsMessage={() => "Nenhum item disponível"}
            styles={selectStyles}
          />
          <Button type="button" variant="secondary" className="gap-2" onClick={handleAdd} disabled={disabled || !pendingOption}>
            <Plus className="h-4 w-4" /> {addButtonLabel}
          </Button>
        </div>

        <div className="rounded-md border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">Itens selecionados</span>
            <span className="text-xs text-slate-500">{selectedOptions.length} selecionado(s)</span>
          </div>
          {selectedOptions.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {selectedOptions.map((option) => (
                <div key={option.value} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="text-sm text-slate-800">{option.label}</span>
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-red-700 hover:bg-red-50 hover:no-underline" onClick={() => handleRemove(option.value)} disabled={disabled}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-slate-500">{emptyMessage}</div>
          )}
        </div>
      </div>
      {helperText && <span className="text-xs text-slate-500">{helperText}</span>}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
};
