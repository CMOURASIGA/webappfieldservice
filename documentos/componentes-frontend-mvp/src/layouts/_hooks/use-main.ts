"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useSessionEntity } from "@/hooks/useSessionEntity";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export function useMain() {
  const [collapsed, setCollapsed] = useState(true);
  const [isOpenChangeEntity, setIsOpenChangeEntity] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleOpenChangeEntity = () => setIsOpenChangeEntity(!collapsed);

  const isMobile = useIsMobile();
  const {
    entityLogged,
    userLogged,
    session,
    entitiesOptions,
    handleChangeEntity,
  } = useSessionEntity();

  const user = {
    entityName: entityLogged?.sigla ?? entityLogged?.name,
    userName: userLogged?.name ?? "",
  };

  useEffect(() => {
    if (isMobile) setCollapsed(false);
  }, [isMobile]);

  useEffect(() => {
    if (!session?.error) return;
    if (session.error === "refresh-token-expired") {
      signOut({ callbackUrl: "/denied/token-expired" });
    }
  }, [session?.error]);

  return {
    toggleSidebar,
    collapsed,
    isOpenChangeEntity,
    toggleOpenChangeEntity,
    user,
    entitiesOptions,
    handleChangeEntity,
    setIsOpenChangeEntity,
  };
}
