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
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold h-6",
          {
            "bg-green-100 text-green-700": variant === "success",
            "bg-amber-100 text-amber-700": variant === "warning",
            "bg-red-100 text-red-700": variant === "danger",
            "bg-blue-100 text-blue-700": variant === "info",
            "bg-slate-100 text-slate-700": variant === "default",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
