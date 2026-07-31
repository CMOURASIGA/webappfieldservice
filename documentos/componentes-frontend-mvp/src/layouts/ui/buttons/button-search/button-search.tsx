import { Button } from "@cnc-ti/layout-basic";
import SearchIcon from "../../icons/search";

export function ButtonSearch(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <Button {...props} className="gap-2">
      <SearchIcon />
      <p className="text-xs font-medium">Pesquisar</p>
    </Button>
  );
}
