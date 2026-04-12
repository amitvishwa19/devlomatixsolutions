"use client";

import { createContext, useContext } from "react";
import { useAtsData } from "../_utils/mockData";

const AtsContext = createContext(null);

export const AtsProvider = ({ children }) => {
  const data = useAtsData();
  return <AtsContext.Provider value={data}>{children}</AtsContext.Provider>;
};

export const useAts = () => {
  const ctx = useContext(AtsContext);
  if (!ctx) throw new Error("useAts must be used within AtsProvider");
  return ctx;
};
