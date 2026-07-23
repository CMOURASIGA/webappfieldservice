import { ButtonHTMLAttributes } from "react";
import { TrashIcon } from "../../icons/trash";

interface ButtonDeleteProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  outline?: boolean;
}

export function ButtonDelete(props: ButtonDeleteProps) {
  const { outline } = props;
  return (
    <button
      type="button"
      className="flex flex-row items-center gap-1 relative px-3 py-2 text-red-400
             bg-white rounded-lg border border-red-200 
              hover:text-white shadow-xs transition-all
               hover:bg-red-500"
      {...props}
    >
      <TrashIcon />
      <p className="text-xs font-medium">Excluir</p>
    </button>
  );
}
