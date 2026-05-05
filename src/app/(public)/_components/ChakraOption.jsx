import Link from "next/link";
import { getChakraById } from "./ChakraData";

const ChakraOption = ({ id, isActive, onClick }) => {
  const chakra = getChakraById(id);
  if (!chakra) return null;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
        isActive 
          ? "bg-secondary border border-border" 
          : "hover:bg-secondary/50"
      }`}
    >
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: chakra.color, color: "#fff" }}
      >
        {chakra.sanskrit}
      </div>
      <div className="text-left">
        <p className="text-sm font-medium">{chakra.name}</p>
        <p className="text-xs text-muted-foreground">{chakra.english}</p>
      </div>
    </button>
  );
};

export default ChakraOption;