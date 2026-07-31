"use client";

import React, { createContext, useState, ReactNode } from "react";

// Tipagem para o contexto
export interface ModalContextProps {
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

// Tipagem para o Provider
export interface ModalProviderProps {
  children: ReactNode;
}

// Criando o Contexto
export const ModalContext = createContext<ModalContextProps | undefined>(
  undefined
);

// Provider do ModalContext
export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalId: string) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
