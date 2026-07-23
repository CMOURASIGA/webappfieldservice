import React from "react";
import cn from "classnames";
import { useFormContext, Controller } from "react-hook-form";

interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  error?: string;
  className?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  name,
  label,
  error,
  className,
  ...rest
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col gap-1">
          {label && (
            <label
              htmlFor={rest.id}
              className="block text-sm font-medium text-gray-600"
            >
              {label}
            </label>
          )}
          <textarea
            {...rest}
            {...field}
            ref={field.ref}
            className={cn(
              "flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm not-disabled:hover:border-brand-gray-500 min-h-[96px]",
              error && "border-red-500",
              className
            )}
          />
          {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
      )}
    />
  );
};
