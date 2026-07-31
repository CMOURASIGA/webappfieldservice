import { Combobox } from "@cnc-ti/layout-basic";
import { InputHTMLAttributes } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils"; // Importe o cn se tiver, ou use template string

export interface SelectFieldProps
  extends InputHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  options: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];
  // Adicionei error aqui caso queira passar manualmente, 
  // mas o RHF já pega automático pelo context
  error?: string;
  modal?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  options,
  className, // Importante receber className para estilização externa
  modal = false,
  ...rest
}) => {
  const { control } = useFormContext();

  const safeOptions = options?.map((opt) => ({
    ...opt,
    label: opt.label ?? "Sem Nome",
  })) || [];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => { // <--- 1. Extraímos o fieldState
        return (
          <div className={cn(
            "cnc-w-full flex flex-col gap-1",
            rest.disabled && "opacity-60 pointer-events-none"
          )}>
            {label && (
                <label className="text-sm font-semibold text-gray-700">
                    {label} {rest.required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* ... */}
            <div className={cn(
              error ? "relative [&_input]:bg-red-50 [&_input]:border-red-500 [&_button]:bg-red-50 [&_button]:border-red-500" : "",
              className
            )}>
              <Combobox
                options={safeOptions}
                placeholder={rest.placeholder || "Selecione uma opção"}
                value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                // modal={modal}
                // disabled={rest.disabled}
                onChange={(selectedValue: string) => {
                  let finalValue: string | number = selectedValue;
                  if (selectedValue !== '' && !isNaN(Number(selectedValue))) {
                    finalValue = Number(selectedValue);
                  } else if (selectedValue === '') {
                    finalValue = '';
                  }

                  field.onChange(finalValue);

                  rest.onChange?.({
                    target: { value: finalValue },
                  } as React.ChangeEvent<HTMLSelectElement>);
                }}
              />
            </div>

            {/* 4. Renderiza a mensagem de erro */}
            {(rest.error || error) && (
              <span className="text-xs text-red-500 mt-1 font-medium">
                {rest.error || error?.message}
              </span>
            )}
          </div>
        );
      }}
    />
  );
};