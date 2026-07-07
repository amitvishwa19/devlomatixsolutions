"use client"
import { useMemo, useState } from "react";
import { BIRTHSTONES } from "../_data/glossary";
import SEO from "../_components/SEO";

const BirthstonesPage = () => {
  const currentMonth = new Date().getMonth();
  const [selected, setSelected] = useState(currentMonth);
  const stone = BIRTHSTONES[selected];

  const monthNum = selected + 1;
  const days = useMemo(() => {
    const year = new Date().getFullYear();
    const total = new Date(year, monthNum, 0).getDate();
    return Array.from({ length: total }, (_, i) => i + 1);
  }, [monthNum]);

  return (
    <div className="min-h-screen bg-background pt-24">
      <SEO title="Birthstones Calendar" description="Discover your birthstone for every month — modern and traditional gems with their meanings and energy." path="/birthstones" />
      <section className="border-b border-border bg-gradient-to-b from-secondary/40 to-background py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary">Birthstone Calendar</p>
          <h1 className="font-serif text-4xl text-foreground md:text-5xl">Find Your Birthstone</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Each month carries a stone of unique meaning. Discover yours and the energy it offers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {BIRTHSTONES.map((b, i) => (
            <button
              key={b.month}
              onClick={() => setSelected(i)}
              className={`rounded-lg border p-3 text-left transition-all ${
                selected === i
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{b.month.slice(0, 3)}</p>
              <p className="mt-1 font-serif text-sm text-foreground">{b.modern}</p>
            </button>
          ))}
        </div>

        <article className={`mt-10 overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${stone.color} text-white shadow-xl`}>
          <div className="bg-black/30 p-8 backdrop-blur md:p-12">
            <p className="text-xs uppercase tracking-[0.3em] opacity-80">{stone.month}</p>
            <h2 className="mt-2 font-serif text-5xl md:text-6xl">{stone.modern}</h2>
            <p className="mt-3 text-sm opacity-80">Traditional: {stone.traditional}</p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed">{stone.meaning}</p>
          </div>
        </article>

        <div className="mt-10">
          <h3 className="mb-4 font-serif text-2xl text-foreground">{stone.month} calendar</h3>
          <div className="grid grid-cols-7 gap-2 rounded-lg border border-border bg-card p-4">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {d}
              </div>
            ))}
            {Array.from({ length: new Date(new Date().getFullYear(), selected, 1).getDay() }, (_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((d) => {
              const isToday = d === new Date().getDate() && selected === currentMonth;
              return (
                <div
                  key={d}
                  className={`aspect-square rounded-md border p-2 text-center text-sm ${
                    isToday
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BirthstonesPage;