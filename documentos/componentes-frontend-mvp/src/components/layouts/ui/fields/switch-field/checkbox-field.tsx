import { cn } from "@/lib/utils";
import { Input } from "@cnc-ti/layout-basic";
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
            {...field}
            type="checkbox"
            checked={Boolean(field.value)}
            onChange={(e) => {
              field.onChange(e);
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
