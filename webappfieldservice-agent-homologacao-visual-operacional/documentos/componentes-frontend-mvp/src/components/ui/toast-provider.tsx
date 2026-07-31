"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextType {
  toast: (t: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, type = "info" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    // Auto dismiss
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all animate-in slide-in-from-right-full",
              "bg-white border-gray-200 text-gray-950",
              t.type === "success" && "border-l-4 border-l-green-500",
              t.type === "error" && "border-l-4 border-l-red-500",
              t.type === "warning" && "border-l-4 border-l-yellow-500",
              t.type === "info" && "border-l-4 border-l-blue-500"
            )}
          >
            <div className="grid gap-1">
              {t.title && <div className="text-sm font-semibold">{t.title}</div>}
              {t.description && <div className="text-sm opacity-90 text-gray-500">{t.description}</div>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:block"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
