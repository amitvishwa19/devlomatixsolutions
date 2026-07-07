import { useEffect, useState } from "react";
import { Flame, Eye } from "lucide-react";

// Deterministic pseudo-random from product id so values stay stable per product
const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

const StockUrgency = ({ productId }) => {
  const seed = hash(productId || "x");
  const stock = (seed % 6) + 2; // 2-7 left
  const baseViewers = (seed % 18) + 6; // 6-23
  const [viewers, setViewers] = useState(baseViewers);

  useEffect(() => {
    setViewers(baseViewers);
    const id = setInterval(() => {
      setViewers((v) => {
        const drift = Math.floor(Math.random() * 5) - 2;
        const next = v + drift;
        return Math.max(4, Math.min(40, next));
      });
    }, 4000);
    return () => clearInterval(id);
  }, [baseViewers]);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30 text-destructive">
        <Flame className="w-3.5 h-3.5" /> Only {stock} left in stock
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-secondary border border-border text-muted-foreground">
        <Eye className="w-3.5 h-3.5 text-gold" />
        <span className="relative flex w-1.5 h-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
        </span>
        {viewers} people viewing now
      </span>
    </div>
  );
};

export default StockUrgency;