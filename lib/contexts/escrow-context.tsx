"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Escrow } from "@/lib/types";

interface EscrowContextType {
  selectedEscrow: Escrow | null;
  setSelectedEscrow: (escrow: Escrow | null) => void;
  clearSelectedEscrow: () => void;
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

interface EscrowProviderProps {
  children: ReactNode;
}

export function EscrowProvider({ children }: EscrowProviderProps) {
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null);

  const clearSelectedEscrow = () => {
    setSelectedEscrow(null);
  };

  const value: EscrowContextType = {
    selectedEscrow,
    setSelectedEscrow,
    clearSelectedEscrow,
  };

  return (
    <EscrowContext.Provider value={value}>{children}</EscrowContext.Provider>
  );
}

export function useEscrowContext() {
  const context = useContext(EscrowContext);
  if (context === undefined) {
    throw new Error("useEscrowContext must be used within an EscrowProvider");
  }
  return context;
}
