import { Button } from "@cnc-ti/layout-basic";
import { cn } from "@/lib/utils";

type ButtonSaveProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function ButtonSave({ loading, children, ...props }: ButtonSaveProps) {
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
          <p>Salvando...</p>
        </>
      ) : (
        children || <p>Salvar alterações</p>
      )}
    </Button>
  );
}
