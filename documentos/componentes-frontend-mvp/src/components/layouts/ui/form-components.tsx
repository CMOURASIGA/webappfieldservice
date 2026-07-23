// src/components/ui/form-components.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@cnc-ti/layout-basic';

interface BaseProps {
    label: string;
    error?: string;
    className?: string;
}

// Input Genérico
export const FormInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & BaseProps>(
    ({ label, error, className, ...props }, ref) => {

        return (
            <div className={cn("flex flex-col gap-1.5", className)}>
                <label className="text-sm font-semibold text-gray-700">
                    {label} {props.required && <span className="text-red-500">*</span>}
                </label>
                <Input
                    ref={ref}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                        error && "border-red-500 focus:ring-red-500 bg-red-50",
                        // props.className removed to avoid duplication/type error
                    )}
                    {...props}
                />
                {error && <span className="text-xs font-medium text-red-500">{error}</span>}
            </div>
        );
    }
);
FormInput.displayName = "FormInput";
export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    options?: SelectOption[]; // <--- Nova propriedade opcional
}
// Select Genérico
export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
    ({ label, error, className, options, children, ...props }, ref) => {
        return (
            <div className={cn("flex flex-col gap-1", className)}>

                {/* Label estilo Wireframe (pequeno e uppercase) */}
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {label} {props.required && <span className="text-red-500">*</span>}
                </label>

                <select
                    ref={ref}
                    className={cn(
                        "w-full py-1 bg-transparent border-b border-gray-300 text-gray-900 font-medium text-base focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                        error && "border-red-400 focus:border-red-500"
                    )}
                    {...props}
                >
                    {/* Lógica Mágica:
              Se passar 'options', ele gera o map.
              Se não passar 'options', ele renderiza o 'children' (uso manual antigo).
          */}
                    {options ? (
                        options.map((opt) => (
                            <option
                                key={String(opt.value)}
                                value={opt.value}
                                disabled={opt.disabled}
                            >
                                {opt.label}
                            </option>
                        ))
                    ) : (
                        children
                    )}
                </select>

                {error && <span className="text-[10px] text-red-500">{error}</span>}
            </div>
        );
    }
);
FormSelect.displayName = "FormSelect";

// Textarea Genérico
export const FormTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & BaseProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className={cn("flex flex-col gap-1.5", className)}>
                <label className="text-sm font-semibold text-gray-700">{label} {props.required && <span className="text-red-500">*</span>}</label>
                <textarea
                    ref={ref}
                    className={cn(
                        "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600",
                        error && "border-red-500 focus:ring-red-500 bg-red-50"
                    )}
                    {...props}
                />
                {error && <span className="text-xs font-medium text-red-500">{error}</span>}
            </div>
        );
    }
);
FormTextarea.displayName = "FormTextarea";

// Checkbox Genérico
export const FormCheckbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(
    ({ label, className, ...props }, ref) => {
        return (
            <div className={cn("flex items-center space-x-2", className)}>
                <input
                    type="checkbox"
                    ref={ref}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    {...props}
                />
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                    {label}
                </label>
            </div>
        );
    }
);
FormCheckbox.displayName = "FormCheckbox";

// Switch Genérico (Toggle Slider)
export const FormSwitch = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(
    ({ label, className, ...props }, ref) => {
        return (
            <div className={cn("flex flex-col gap-1.5", className)}>
                <label className="text-sm font-semibold text-gray-700">{label}</label>
                <div className="flex items-center h-10">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            ref={ref}
                            className="sr-only peer"
                            {...props}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                </div>
            </div>
        );
    }
);
FormSwitch.displayName = "FormSwitch";