import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  className?: string;
}


export function InfoCard({ icon, label, value, sublabel, className }: InfoCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#fff5f0] flex items-center justify-center text-[#FF6B35]">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
          {label}
        </span>
        <div className="flex flex-col">
          <span className="text-base font-bold text-[#003366] leading-tight capitalize">
            {value}
          </span>
          {sublabel && (
            <span className="text-xs text-gray-400 mt-1 font-medium">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

