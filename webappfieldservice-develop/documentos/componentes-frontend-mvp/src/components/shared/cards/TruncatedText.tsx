"use client";

import { ReactNode } from "react";

type TruncatedTextProps = {
  children: ReactNode;
  lines?: number;
  className?: string;
  emptyText?: string;
  emptyClassName?: string;
};

export function TruncatedText({
  children,
  lines = 2,
  className = "text-sm cnc-text-brand-gray-700",
  emptyText = "Sem descrição informada",
  emptyClassName = "text-gray-400 italic",
}: TruncatedTextProps) {
  const isEmpty = !children || (typeof children === "string" && children.trim() === "");

  return (
    <p
      className={`overflow-hidden text-ellipsis break-words ${isEmpty ? emptyClassName : className}`}
      style={{
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical",
      }}
    >
      {isEmpty ? emptyText : children}
    </p>
  );
}
