import React from "react";
import { cn } from "../../utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-[13px] font-semibold text-slate-700">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            "min-h-[96px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-blue-700 focus-visible:ring-3 focus-visible:ring-blue-700/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
            error && "border-red-700 focus-visible:border-red-700 focus-visible:ring-red-700/15",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-700">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
