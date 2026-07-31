import { Button } from "@cnc-ti/layout-basic";
import SearchIcon from "../../icons/search";
import { cn } from "@/lib/utils";

type ButtonSearchProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function ButtonSearch({ loading, ...props }: ButtonSearchProps) {
  return (
    <Button
      {...props}
      className={cn("gap-2 flex items-center justify-center", props.className)}
      disabled={loading || props.disabled}
    >
      {loading ? (
        <>
          {/* Spinner simples com Tailwind */}
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Buscando...</p>
        </>
      ) : (
        <>
          <SearchIcon />
          <p className="text-xs font-medium">Pesquisar</p>
        </>
      )}
    </Button>
  );
}
