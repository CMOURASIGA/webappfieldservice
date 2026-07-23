import React from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          {
            "border-green-300 bg-green-100 text-green-800": variant === "success",
            "border-amber-300 bg-amber-100 text-amber-800": variant === "warning",
            "border-red-300 bg-red-100 text-red-800": variant === "danger",
            "border-blue-300 bg-blue-100 text-blue-800": variant === "info",
            "border-slate-300 bg-slate-100 text-slate-700": variant === "default",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
