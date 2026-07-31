"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Clarity from "@microsoft/clarity";
import { useSessionEntity } from "@/hooks/useSessionEntity";
import { trackPageView } from "@/utils/analytics";

export default function ClarityIdentifyUser() {
  const pathname = usePathname();
  const { userLogged, entityLogged, isAuthenticated } = useSessionEntity();

  useEffect(() => {
    if (userLogged?.email) {
      Clarity.identify(userLogged.email, undefined, pathname || "", userLogged.name || "");
    }
    const feature = pathname?.startsWith("/negociacoes")
      ? "negociacoes"
      : pathname?.startsWith("/clausulas")
      ? "clausulas"
      : pathname?.startsWith("/paineis")
      ? "paineis"
      : pathname?.startsWith("/cadastros-gerais")
      ? "cadastros"
      : "geral";
    trackPageView({
      page: pathname || "/",
      feature,
      entity_name: entityLogged?.name || "",
      entity_id: String(entityLogged?.id ?? ""),
      authenticated: isAuthenticated ? "true" : "false",
    });
  }, [pathname, userLogged?.email, userLogged?.name, entityLogged?.name, entityLogged?.id, isAuthenticated]);

  return null;
}
