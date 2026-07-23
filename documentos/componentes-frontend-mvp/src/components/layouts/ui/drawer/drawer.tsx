"use client";
import { useDrawer } from "@/hooks/use-drawer";
import cn from "classnames";
import { ReactNode, useEffect, useState } from "react";

interface DrawerProps {
  children: ReactNode;
  id: string;
  width: string;
  elevateIndex?: boolean;
}

interface DrawerSectionProps {
  children: ReactNode;
}

export function Drawer({ children, id, width = "700px", elevateIndex }: DrawerProps) {
  const { activeDrawer, closeDrawer } = useDrawer();
  const isOpen = activeDrawer === id;
  const [computedWidth, setComputedWidth] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setComputedWidth(width);
    } else {
      setComputedWidth("100%");
    }
  }, [isOpen, width]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const overlayZIndex = elevateIndex ? "z-[54]" : "z-40";
  const containerZIndex = elevateIndex ? "z-[55]" : "z-[50]";

  return (
    <>
      <div
        data-testid="drawer-overlay"
        className={cn(
          `fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-500 ${overlayZIndex}`,
          {
            "opacity-100 pointer-events-auto": isOpen,
            "opacity-0 pointer-events-none": !isOpen,
          }
        )}
        style={{ margin: 0 }}
        onClick={closeDrawer}
      />

      <div
        data-testid="drawer-container"
        className={cn(
          `fixed top-0 right-0 h-full bg-white shadow-xl ${containerZIndex} flex flex-col transition-transform duration-500 w-full lg:w-auto`,
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ width: computedWidth, marginTop: 0 }}
      >
        {children}
      </div>
    </>
  );
}

export function DrawerHeader({ children }: DrawerSectionProps) {
  const { closeDrawer } = useDrawer();

  return (
    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
      <div className="text-lg font-semibold">{children}</div>
      <button
        onClick={closeDrawer}
        aria-label="Fechar Drawer"
        className="flex flex-col items-center justify-center text-center relative px-2 py-2 text-[#00247d]
             bg-white rounded-lg border border-gray-200 
              hover:text-gray-900 shadow-xs 
               hover:bg-gray-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.25}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export function DrawerContent({ children }: DrawerSectionProps) {
  return <div className="flex-1 overflow-y-auto px-8 py-4">{children}</div>;
}

export function DrawerFooter({ children }: DrawerSectionProps) {
  return (
    <div className="px-8 py-2 border-t border-gray-200 sticky bottom-0 bg-white">
      {children}
    </div>
  );
}
