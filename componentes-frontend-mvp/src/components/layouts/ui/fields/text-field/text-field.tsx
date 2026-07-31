import { cn } from "@/lib/utils";
import { Input } from "@cnc-ti/layout-basic";
import React, { InputHTMLAttributes } from "react";
import { Controller, useFormContext } from "react-hook-form";

export const formatCurrency = (value: string) => {
  const isNegative = value.includes("-");
  const onlyNumbers = value.replace(/\D/g, "");
  const number = parseFloat(onlyNumbers) / 100;

  if (isNaN(number)) return "";
  return isNegative
    ? (number * -1).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    : number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
};
export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  name,
  label,
  type = "text",
  ...rest
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  const textLabel = label?.includes("*") ? label.replace("*", "") : `${label}`;
  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
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
            <Input
              {...field}
              className={cn(rest.className, "h-10")}
              onChange={(e) => {
                let value = e.target.value;
                if (type === "money") {
                  value = formatCurrency(value);
                }
                field.onChange(value);
                rest.onChange?.(e);
              }}
              value={field.value || ""}
              type={type}
              {...rest}
            />
            {error && (
              <span className="text-red-500 text-xs mt-1 block">{error}</span>
            )}
          </div>
        )}
      />
    </>
  );
};
