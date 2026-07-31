import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

function objetosParaStrings(objeto: any, key: string) {
  const paresChaveValor = Object?.entries(objeto).map(([chave, valor]: [string, any]) => {
    if (valor) return `${chave}=${valor?.[key] || valor}`;
  });
  return paresChaveValor.filter((p) => p != undefined).join("&");
}

export default function useRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleItemClick = useCallback(
    (filtros: Record<string, any>, rotaDestino?: string) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(filtros).forEach(([key, value]) => {
        if (value === undefined || value === null || String(value).trim() === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const path = rotaDestino || pathname;
      router.replace(`${path}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return { handleItemClick };
}
