import { cn } from "@/lib/utils";
import { Input } from "@cnc-ti/layout-basic";
import React, { InputHTMLAttributes } from "react";
import { Controller, useFormContext } from "react-hook-form";

export interface DateFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  name,
  label,
  ...rest
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="cnc-w-full">
          <Input
            {...rest}
            {...field}
            onChange={(e) => {
              field.onChange(e);
              rest.onChange?.(e);
            }}
            className={cn(rest.className, "h-10 flex flex-col justify-between")}
            value={field.value || ""}
            label={label}
            type="date"
          />
          {error && (
            <span className="text-red-500 text-xs mt-1 block">{error}</span>
          )}
        </div>
      )}
    />
  );
};
