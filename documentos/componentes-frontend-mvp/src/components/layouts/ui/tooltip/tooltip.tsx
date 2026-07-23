// import IconInfo from "@/icons/info";

interface ToolTipProps {
  text: string;
  children: React.ReactNode;
}

export function Tooltip({ text, children }: ToolTipProps) {
  return (
    <div className="relative group">
      <div className="absolute bottom-full mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white rounded py-1 px-2 text-xs flex items-center gap-1">
        {/* <IconInfo /> */}
        {text}
      </div>
      <span className="cursor-pointer">{children}</span>
    </div>
  );
}
