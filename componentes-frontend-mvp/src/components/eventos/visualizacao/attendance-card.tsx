import { Clock } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AttendanceMetric {
  label: string;
  value: number;
  color: string;
}

interface AttendanceCardProps {
  metrics: AttendanceMetric[];
  source: string;
  updatedAt: string;
  showUpdatedAt?: boolean;
  className?: string;
}

export function AttendanceCard({
  metrics,
  source,
  updatedAt,
  showUpdatedAt = true,
}: AttendanceCardProps) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#9ca3af] mb-[14px]">
        Público & Participantes
      </div>

      <div className="bg-[#fafafa] border border-[#e8eaed] rounded-[10px] overflow-hidden">
        {/* Métricas */}
        <div className="grid grid-cols-3">
          {metrics.map((item, i) => (
            <div
              key={item.label}
              className={cn(
                "px-[18px] py-4",
                i < metrics.length - 1 && "border-r border-[#e8eaed]",
              )}
            >
              <div className="flex items-center gap-[5px] text-[10px] font-bold uppercase tracking-[0.6px] text-[#9ca3af] mb-1.5">
                <span
                  className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                  style={{ background: item.color }}
                />
                {item.label}
              </div>
              <div className="text-[22px] font-extrabold leading-none text-[#1a2332]">
                {item.value.toLocaleString("pt-BR")}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé: fonte + última atualização */}
        <div className="flex items-center justify-between px-[18px] py-2.5 border-t border-[#e8eaed] bg-white">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white text-[#1d4ed8] border border-[#4b5563]">
            <Image
              src={`/${source.toLowerCase()}.png`}
              alt={source}
              width={80}
              height={80}
              className="object-contain"
            />
          </span>
          {showUpdatedAt && (
            <div className="flex items-center gap-[5px] text-[11px] text-[#9ca3af]">
              <Clock className="w-3 h-3" strokeWidth={2} />
              {updatedAt}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
