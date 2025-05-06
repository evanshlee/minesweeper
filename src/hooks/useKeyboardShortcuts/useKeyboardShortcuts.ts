import { useEffect } from "react";

interface ShortcutActions {
  onRestart?: () => void;
}

export function useKeyboardShortcuts({ onRestart }: ShortcutActions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "r" || e.key === "R") && onRestart) {
        onRestart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRestart]);
}
