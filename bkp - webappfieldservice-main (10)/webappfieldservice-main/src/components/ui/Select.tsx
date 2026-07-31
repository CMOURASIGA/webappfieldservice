import React from "react";
import { cn } from "../../utils/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-[13px] font-semibold text-slate-700">{label}</label>}
        <select
          ref={ref}
          className={cn(
            "h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus-visible:outline-none focus-visible:border-blue-700 focus-visible:ring-3 focus-visible:ring-blue-700/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
            error && "border-red-700 focus-visible:border-red-700 focus-visible:ring-red-700/15",
            className
          )}
          {...props}
        >
          {!children && <option value="" disabled>Selecione...</option>}
          {children || (options && options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )))}
        </select>
        {error && <span className="text-xs text-red-700">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
