"use client";

import { DrawerContext, DrawerContextProps } from "@/providers/drawer.context";
import { useContext } from "react";

export const useDrawer = (): DrawerContextProps => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer deve ser usado dentro de um DrawerProvider");
  }
  return context;
};
