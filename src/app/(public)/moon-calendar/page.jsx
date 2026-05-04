"use client"
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMoonPhase, PHASE_INFO } from "../_data/glossary";
import SEO from "../_components/SEO";

const MoonCalendarPage = () => {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const monthData = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const total = new Date(view.year, view.month + 1, 0).getDate();
    const startDay = first.getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= total; d++) {
      const date = new Date(view.year, view.month, d, 12);
      days.push({ day: d, date, ...getMoonPhase(date) });
    }
    return days;
  }, [view]);

  const todayPhase = getMoonPhase(today);
  const todayInfo = PHASE_INFO[todayPhase.name];

  const monthName = new Date(view.year, view.month).toLocaleString("en-US", { month: "long", year: "numeric" });

  const shift = (d) => {
    const m = view.month + d;
    setView({ year: view.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 });
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <SEO title="Moon Phase & Ritual Calendar" description="Live moon phase, illumination and ritual guidance with crystal recommendations for every lunar phase." path="/moon-calendar" />
      <section className="border-b border-border bg-gradient-to-b from-indigo-950/30 via-secondary/30 to-background py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary">Moon & Ritual Calendar</p>
          <h1 className="font-serif text-4xl text-foreground md:text-5xl">Today's Moon</h1>
          <div className="mt-6 inline-flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/80 px-8 py-6 backdrop-blur">
            <span className="text-7xl">{todayInfo.icon}</span>
            <p className="font-serif text-2xl text-foreground">{todayPhase.name}</p>
            <p className="text-xs text-muted-foreground">
              Day {todayPhase.age} of cycle · {todayPhase.illumination}% illuminated
            </p>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">{todayInfo.ritual}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {todayInfo.crystals.map((c) => (
                <Badge key={c} variant="outline" className="border-primary/40 text-primary">{c}</Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => shift(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-secondary"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-serif text-2xl text-foreground">{monthName}</h2>
          <button
            onClick={() => shift(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-secondary"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 rounded-xl border border-border bg-card p-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {d}
            </div>
          ))}
          {monthData.map((cell, i) => {
            if (!cell) return <div key={`pad-${i}`} />;
            const isToday =
              cell.date.toDateString() === today.toDateString();
            const info = PHASE_INFO[cell.name];
            const isMajor = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"].includes(cell.name);
            return (
              <div
                key={cell.day}
                className={`group relative aspect-square rounded-lg border p-2 transition-all hover:border-primary hover:shadow-md ${
                  isToday ? "border-primary bg-primary/10" : "border-border bg-background"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-xs ${isToday ? "font-bold text-primary" : "text-foreground"}`}>
                    {cell.day}
                  </span>
                  <span className="text-base leading-none">{info.icon}</span>
                </div>
                {isMajor && (
                  <p className="mt-1 hidden text-[9px] leading-tight text-muted-foreground md:block">
                    {cell.name.replace(" Moon", "").replace(" Quarter", " Qtr")}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {Object.entries(PHASE_INFO).map(([name, info]) => (
            <article key={name} className="rounded-lg border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl">{info.icon}</span>
                <h3 className="font-serif text-lg text-foreground">{name}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{info.ritual}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {info.crystals.map((c) => (
                  <Badge key={c} className="bg-primary/10 text-primary hover:bg-primary/20">{c}</Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MoonCalendarPage;