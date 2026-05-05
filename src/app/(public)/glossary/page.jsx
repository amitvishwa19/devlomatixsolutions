"use client"
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GLOSSARY } from "../_data/glossary";
import SEO from "../_components/SEO";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const CHAKRAS = ["All", "Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"];

const GlossaryPage = () => {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("All");
  const [chakra, setChakra] = useState("All");

  const available = useMemo(() => new Set(GLOSSARY.map((g) => g.name[0].toUpperCase())), []);

  const filtered = useMemo(() => {
    return GLOSSARY.filter((c) => {
      if (letter !== "All" && c.name[0].toUpperCase() !== letter) return false;
      if (chakra !== "All" && !c.chakra.includes(chakra)) return false;
      if (query && !`${c.name} ${c.intent.join(" ")} ${c.description}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, letter, chakra]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, c) => {
      const k = c.name[0].toUpperCase();
      (acc[k] = acc[k] || []).push(c);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background pt-24">
      <SEO title="Crystal Glossary A–Z" description="Encyclopedia of 40+ healing crystals with chakras, zodiacs, hardness and meanings. Filter by letter, chakra and intent." path="/glossary" />
      <section className="border-b border-border bg-gradient-to-b from-secondary/40 to-background py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary">Encyclopedia</p>
          <h1 className="font-serif text-4xl text-foreground md:text-5xl">Crystal Glossary A–Z</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Explore {GLOSSARY.length} crystals with their properties, chakras, origins and meanings.
          </p>

          <div className="mx-auto mt-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, intent, or property…"
                className="h-12 rounded-full border-border bg-background pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 space-y-3">
          <div className="flex flex-wrap justify-center gap-1">
            <button
              onClick={() => setLetter("All")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${letter === "All" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              All
            </button>
            {ALPHABET.map((l) => {
              const has = available.has(l);
              const active = letter === l;
              return (
                <button
                  key={l}
                  disabled={!has}
                  onClick={() => setLetter(l)}
                  className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : has
                      ? "text-foreground hover:bg-secondary"
                      : "cursor-not-allowed text-muted-foreground/30"
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {CHAKRAS.map((c) => (
              <button
                key={c}
                onClick={() => setChakra(c)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  chakra === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No crystals match your filters.</p>
        ) : (
          Object.keys(grouped).sort().map((key) => (
            <div key={key} className="mb-10">
              <h2 className="mb-4 flex items-center gap-3 font-serif text-3xl text-primary">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                  {key}
                </span>
                <span className="text-sm uppercase tracking-widest text-muted-foreground">
                  {grouped[key].length} {grouped[key].length === 1 ? "crystal" : "crystals"}
                </span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {grouped[key].map((c) => (
                  <article
                    key={c.name}
                    className="rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-serif text-xl text-foreground">{c.name}</h3>
                      <Badge variant="outline" className="shrink-0">{c.color}</Badge>
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div><dt className="inline text-muted-foreground">Chakra: </dt><dd className="inline text-foreground">{c.chakra}</dd></div>
                      <div><dt className="inline text-muted-foreground">Hardness: </dt><dd className="inline text-foreground">{c.hardness}</dd></div>
                      <div><dt className="inline text-muted-foreground">Zodiac: </dt><dd className="inline text-foreground">{c.zodiac}</dd></div>
                      <div><dt className="inline text-muted-foreground">Origin: </dt><dd className="inline text-foreground">{c.origin}</dd></div>
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {c.intent.map((i) => (
                        <Badge key={i} className="bg-primary/10 text-primary hover:bg-primary/20">{i}</Badge>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default GlossaryPage;