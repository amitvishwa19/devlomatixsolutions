import Link from "next/link";

const ThroatChakra = () => {
  const chakra = {
    id: "throat",
    name: "Vishuddha",
    english: "Throat",
    color: "#3aa6ff",
    cy: 155,
    sanskrit: "हं",
    element: "Ether",
    crystals: ["Aquamarine", "Lapis Lazuli", "Turquoise"],
    affirmation: "I speak my truth with clarity.",
    desc: "Voice of authentic expression, truth, and clear communication.",
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-background font-bold text-lg"
          style={{ backgroundColor: chakra.color, boxShadow: `0 0 20px ${chakra.color}80` }}
        >
          {chakra.sanskrit}
        </div>
        <div>
          <p className="text-xs tracking-widest" style={{ color: chakra.color }}>{chakra.element}</p>
          <h3 className="font-serif text-2xl">
            {chakra.name} <span className="text-muted-foreground text-base">— {chakra.english}</span>
          </h3>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{chakra.desc}</p>
      <p className="italic text-sm border-l-2 pl-3 mb-5" style={{ borderColor: chakra.color, color: chakra.color }}>
        "{chakra.affirmation}"
      </p>
      <p className="text-[11px] text-gold tracking-widest mb-2">✦ HEALING CRYSTALS</p>
      <div className="flex flex-wrap gap-2">
        {chakra.crystals.map((c) => (
          <Link
            key={c}
            href={`/shop?search=${encodeURIComponent(c)}`}
            className="text-xs border border-border bg-secondary/40 hover:border-gold/50 hover:bg-secondary px-3 py-1.5 rounded-full transition-colors"
          >
            {c}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ThroatChakra;