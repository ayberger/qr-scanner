// context/HistoryContext.tsx
import React, { createContext, useContext, useState } from "react";

export type HistoryType = "qr" | "barcode" | "document";

export interface HistoryItem {
  id: string;
  type: HistoryType;
  value: string;
  date: string;
}

interface HistoryContextData {
  items: HistoryItem[];
  addItem: (type: HistoryType, value: string) => void;
  clear: () => void;
}

const HistoryContext = createContext<HistoryContextData | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<HistoryItem[]>([]);

  const addItem = (type: HistoryType, value: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      type,
      value,
      date: new Date().toLocaleString(),
    };
    setItems(prev => [newItem, ...prev]);
  };

  const clear = () => {
    setItems([]);
  };

  return (
    <HistoryContext.Provider value={{ items, addItem, clear }}>
      {children}
    </HistoryContext.Provider>
  );
};

// Custom Hook — her ekranda rahatça
export const useHistoryStore = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistoryStore must be used inside HistoryProvider");
  return ctx;
};
