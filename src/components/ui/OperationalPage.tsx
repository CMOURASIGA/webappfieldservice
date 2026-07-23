import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { cn } from "../../utils/cn";

interface OperationalPageHeaderProps {
  title: string;
  description: string;
  backTo?: string;
  actions?: React.ReactNode;
}

export const OperationalPageHeader = ({ title, description, backTo, actions }: OperationalPageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-1 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        {backTo && (
          <Button type="button" variant="secondary" size="sm" className="mt-0.5 shrink-0 gap-2" onClick={() => navigate(backTo)}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        )}
        <div className="min-w-0 border-l-4 border-brand-700 pl-3">
          <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-[22px]">{title}</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
};

interface MetricButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  value: number;
  active?: boolean;
  valueClassName?: string;
}

export const MetricButton = ({ label, value, active, valueClassName, className, ...props }: MetricButtonProps) => (
  <button
    type="button"
    aria-pressed={active}
    className={cn(
      "min-h-24 rounded-xl border-2 bg-white p-4 text-left shadow-1 transition-all hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-700/25",
      active ? "border-brand-700 bg-brand-050 ring-1 ring-brand-700/15" : "border-slate-200",
      className,
    )}
    {...props}
  >
    <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
    <span className={cn("block text-2xl font-bold text-slate-900", valueClassName)}>{value}</span>
  </button>
);

export const FormGrid = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid grid-cols-1 gap-5 rounded-lg border border-slate-300 bg-slate-50/70 p-4 md:grid-cols-2", className)} {...props} />
);
