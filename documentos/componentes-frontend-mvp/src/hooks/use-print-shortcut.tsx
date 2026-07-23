import { useEffect } from "react";

export function usePrintShortcut(onPrint: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const isPrintShortcut =
        (isMac && e.metaKey && e.key.toLowerCase() === "p") ||
        (!isMac && e.ctrlKey && e.key.toLowerCase() === "p");

      if (isPrintShortcut) {
        e.preventDefault();
        onPrint();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPrint]);
}
