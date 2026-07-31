"use client";

import { Badge } from "@cnc-ti/layout-basic";
import { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger";

type CardBadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  title?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  primary: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
  success: "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200",
  warning: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
};

export function CardBadge({ children, variant = "default", className = "", title }: CardBadgeProps) {
  const variantClass = variantStyles[variant];

  return (
    <Badge
      variant={variant === "default" ? "default" : "primary"}
      className={`${variantClass} ${className}`}
      title={title}
    >
      {children}
    </Badge>
  );
}
