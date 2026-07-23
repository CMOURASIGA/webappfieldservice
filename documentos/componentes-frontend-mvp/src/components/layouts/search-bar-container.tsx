"use client";

import { cn } from "@/lib/utils";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

export function SearchBarContainer({ children, className }: Props) {
  return (
    <div className={cn("w-full px-8 py-10 border-b bg-gray-50", className)}>
      {children}
    </div>
  );
}
