import { createContext, useContext, ReactNode } from "react";
import { useAtsData } from "@/ATS/data/mockData";

type AtsContextType = ReturnType<typeof useAtsData>;

const AtsContext = createContext<AtsContextType | null>(null);

export const AtsProvider = ({ children }: { children: ReactNode }) => {
  const data = useAtsData();
  return <AtsContext.Provider value={data}>{children}</AtsContext.Provider>;
};

export const useAts = () => {
  const ctx = useContext(AtsContext);
  if (!ctx) throw new Error("useAts must be used within AtsProvider");
  return ctx;
};
