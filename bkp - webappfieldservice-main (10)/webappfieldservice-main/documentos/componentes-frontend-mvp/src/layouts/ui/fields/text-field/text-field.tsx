import React, { InputHTMLAttributes } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@cnc-ti/layout-basic";

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
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          {...rest}
          {...field}
          onChange={(e) => {
            field.onChange(e);
            rest.onChange?.(e);
          }}
          value={field.value || ""}
          label={label}
          type={type}
        />
      )}
    />
  );
};
