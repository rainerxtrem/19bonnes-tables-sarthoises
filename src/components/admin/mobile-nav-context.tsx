"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Contexte minimal (juste un booléen + son setter) pour partager l'état du
// tiroir de navigation mobile entre la sidebar et le bouton hamburger du
// topbar — deux composants clients frères dans l'arbre, pas de relation
// parent/enfant directe possible pour un simple passage de props.
interface MobileNavState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MobileNavContext = createContext<MobileNavState | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <MobileNavContext.Provider value={{ open, setOpen }}>{children}</MobileNavContext.Provider>;
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) throw new Error("useMobileNav doit être utilisé sous MobileNavProvider");
  return ctx;
}
