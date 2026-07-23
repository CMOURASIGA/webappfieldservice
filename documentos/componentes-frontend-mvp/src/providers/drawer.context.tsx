"use client";

import React, { createContext, useState, ReactNode } from "react";

export interface DrawerContextProps {
  activeDrawer: string | null;
  openDrawer: (DrawerId: string) => void;
  closeDrawer: () => void;
}

export interface DrawerProviderProps {
  children: ReactNode;
}

export const DrawerContext = createContext<DrawerContextProps | undefined>(
  undefined
);

export const DrawerProvider: React.FC<DrawerProviderProps> = ({ children }) => {
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);

  const openDrawer = (DrawerId: string) => setActiveDrawer(DrawerId);
  const closeDrawer = () => setActiveDrawer(null);

  return (
    <DrawerContext.Provider value={{ activeDrawer, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};
