import React from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "create" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-700/25 disabled:pointer-events-none disabled:bg-slate-300 disabled:text-slate-500",
          {
            "bg-brand-900 text-white hover:bg-brand-800 active:bg-brand-900": variant === "primary",
            "border border-green-700 bg-green-600 text-white shadow-sm hover:bg-green-700 active:bg-green-800": variant === "create",
            "border border-slate-400 bg-white text-brand-900 shadow-sm hover:border-brand-700 hover:bg-brand-050": variant === "secondary",
            "border border-red-800 bg-red-700 text-white shadow-sm hover:bg-red-800": variant === "destructive",
            "bg-transparent text-brand-900 hover:underline hover:bg-transparent": variant === "ghost",
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
