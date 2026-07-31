import { Combobox } from "@cnc-ti/layout-basic";
import { FormEvent, InputHTMLAttributes } from "react";
import { Controller, useFormContext } from "react-hook-form";

export interface SelectFieldProps
  extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'onInput'> {
  name: string;
  label?: string;
  options: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];
  notFoundContent?: string;
  modal?: boolean;
  onInput?: (value: string) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  options,
  notFoundContent,
  modal = false,
  ...rest
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;
  const textLabel = label?.includes("*") ? label.replace("*", "") : `${label}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        // Garantir que o valor seja sempre uma string válida
        const fieldValue = field.value ?? "";
        const safeValue = typeof fieldValue === "string" ? fieldValue : String(fieldValue || "");

        // Filtrar props do rest que podem causar problemas
        const { onChange: restOnChange, onInput: restOnInput, ...restProps } = rest;

        return (
          <div className="cnc-w-full">
            <label
              htmlFor=""
              className="text-sm block mb-1 font-medium text-gray-600"
            >
              {label && textLabel}
              {label && rest.required && (
                <span className="text-red-500"> *</span>
              )}
            </label>

            <Combobox
              {...restProps}
              // onInput removed as it is not supported by Combobox props
              options={options.map(option => ({
                label: typeof option.label === "string" ? option.label : "",
                value: typeof option.value === "string" ? option.value : "",
                disabled: option.disabled || false
              }))}
              placeholder={rest.placeholder || "Selecione uma opção"}
              value={safeValue}
              onChange={(e) => {
                const newValue = typeof e === "string" ? e : "";
                field.onChange(newValue);
                if (restOnChange) {
                  restOnChange({
                    target: { value: newValue },
                  } as React.ChangeEvent<HTMLSelectElement>);
                }
              }}
              command={{ emptyMessage: notFoundContent }}
            // popoverClassName removed as it is not supported
            />
            {error && (
              <span className="text-red-500 text-xs mt-1 block">{error}</span>
            )}
          </div>
        );
      }}
    />
  );
};
