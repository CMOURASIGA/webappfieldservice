"use client";

import { ModalContext, ModalContextProps } from "@/providers/modal-context";
import { useContext } from "react";

export const useModal = (): ModalContextProps => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal deve ser usado dentro de um ModalProvider");
  }
  return context;
};
