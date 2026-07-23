import { cn } from "@/lib/utils";

interface EventBadgeProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  type?: string;
  variant?: 'blue' | 'green' | 'orange' | 'gray' | 'yellow';
  className?: string;
}


const variantStyles = {
  blue: 'bg-[#003366] text-white',
  green: 'bg-[#e7f6ed] text-[#28A745] border border-[#d1f0db]',
  orange: 'bg-[#fff5f0] text-[#FF6B35] border border-[#ffede4]',
  gray: 'bg-[#f4f4f5] text-[#71717a] border border-[#e4e4e7]',
  yellow: 'bg-[#fefce8] text-[#854d0e] border border-[#fef9c3]',
};


export function EventBadge({ label, icon, variant = 'blue', className }: EventBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span>{label}</span>
    </div>
  );
}
