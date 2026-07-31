import PrintIcon from "../../icons/print";

export function ButtonPrint(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      type="button"
      className="flex flex-row items-center gap-1 relative px-3 py-2 text-[#00247d]
             bg-white rounded-lg border border-gray-200 
              hover:text-gray-900 shadow-xs transition-all
               hover:bg-gray-200"
      {...props}
    >
      <PrintIcon />
      <p className="text-xs font-medium">Imprimir</p>
    </button>
  );
}
