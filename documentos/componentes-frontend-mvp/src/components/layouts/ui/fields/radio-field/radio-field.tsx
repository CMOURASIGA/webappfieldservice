import { Input } from "@cnc-ti/layout-basic";
import React, { InputHTMLAttributes } from "react";
import { Controller, useFormContext } from "react-hook-form";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  value: string;
}

export const RadioField: React.FC<TextFieldProps> = ({
  name,
  label,
  value,
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
        return (
          <div className="cnc-w-full flex items-center gap-1">
            <label
              htmlFor=""
              className="text-sm block font-medium text-gray-600 whitespace-nowrap "
            >
              {label}
            </label>

            <Input
              className={(rest.className, "h-10 w-4")}
              {...rest}
              {...field}
              onChange={(e) => {
                field.onChange(e);
                rest.onChange?.(e);
              }}
              value={value || ""}
              checked={field.value === value}
              type="radio"
            />
          </div>
        );
      }}
    />
  );
};
