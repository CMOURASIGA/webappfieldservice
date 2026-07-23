import React, { InputHTMLAttributes } from "react";
import { Controller, useFormContext } from "react-hook-form";

export interface CheckBoxFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

export const CheckBoxField: React.FC<CheckBoxFieldProps> = ({
  name,
  label,
  ...rest
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-row items-center space-x-2">
          <input
            {...rest}
            type="checkbox"
            checked={field.value === "Sim"}
            onChange={(e) => {
              const newValue = e.target.checked ? "Sim" : "Não";
              field.onChange(newValue);
              rest.onChange?.(e);
            }}
          />
          {label && (
            <label className="font-medium text-xs" htmlFor={name}>
              {label}
            </label>
          )}
        </div>
      )}
    />
  );
};
