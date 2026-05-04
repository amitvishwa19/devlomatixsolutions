"use client"
import { motion } from "framer-motion";
import Link from "next/link";
import { Droplets, Wind, Moon, Sun, Music, Leaf, Sparkles, AlertTriangle } from "lucide-react";
import SEO from "../_components/SEO";

const methods = [
  { icon: Wind, title: "Sage / Palo Santo Smoke", desc: "Pass each stone slowly through the smoke. The most universal cleanser — safe for every crystal.", time: "30 sec" },
  { icon: Moon, title: "Full Moonlight", desc: "Place crystals on a windowsill overnight under the full moon. Gentle, deeply restorative.", time: "8–12 hrs" },
  { icon: Music, title: "Sound Bath", desc: "Tibetan bowls, tuning forks, or chanting at 432 Hz shake stagnant energy loose.", time: "1–3 min" },
  { icon: Droplets, title: "Running Water", desc: "Cool running water for one minute. Only safe for hard stones — not selenite, malachite, or kyanite.", time: "1 min" },
  { icon: Leaf, title: "Earth Burial", desc: "Bury overworked stones in soil overnight. The earth absorbs heaviness and returns clarity.", time: "Overnight" },
  { icon: Sun, title: "Brief Sunlight", desc: "Morning sun for under 30 minutes. Avoid for amethyst, rose quartz, and citrine — they fade.", time: "<30 min" },
];

const ritual = [
  "Cleanse the space first — light incense, open a window, set the tone.",
  "Hold each crystal in your dominant hand. Take three slow breaths with it.",
  "Choose a method that matches the stone (see the chart above).",
  "Cleanse the stone, then rest it on a selenite plate for 10 minutes.",
  "Close your eyes. Speak (silently or aloud) the intention you wish to charge it with.",
  "Place it back on your altar, in your pocket, or against your skin. It is ready.",
];

const safety = [
  { stone: "Selenite", warn: "Dissolves in water. Cleanse with smoke or sound only." },
  { stone: "Malachite", warn: "Contains copper. Never use water — always dry methods." },
  { stone: "Amethyst", warn: "Fades in sunlight. Use moonlight to recharge." },
  { stone: "Pyrite", warn: "Rusts when wet. Wipe with a dry cloth only." },
  { stone: "Kyanite", warn: "Self-cleansing — never holds negative energy. No need to cleanse." },
  { stone: "Lapis Lazuli", warn: "Soft stone. Avoid salt and prolonged water exposure." },
];

const CrystalCarePage = () => {
  return (
    <div className="pt-20 pb-20">
      <SEO title="Crystal Care & Cleansing" description="Learn how to cleanse, charge and care for your crystals with our complete care guide." path="/crystal-care" />
      <section className="py-16 text-center px-4">
        <Sparkles className="w-10 h-10 text-gold mx-auto mb-4" />
        <p className="text-gold text-sm tracking-widest mb-2">✦ THE SACRED PRACTICE ✦</p>
        <h1 className="font-serif text-5xl md:text-7xl mb-4">
          Crystal <span className="text-gold italic">Care</span> & Cleansing
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Crystals absorb the energies they encounter. These rituals return them to their original radiance — so they continue to serve you with full power.
        </p>
        <div className="w-20 h-1 bg-gold mx-auto mt-6 rounded-full" />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-serif text-3xl md:text-4xl text-center mb-3">
          Six <span className="text-gold">Cleansing Methods</span>
        </motion.h2>
        <p className="text-center text-sm text-muted-foreground mb-12">Choose the ritual that calls to you — or rotate through them all.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-6 hover:border-gold/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center mb-4">
                <m.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-xl">{m.title}</h3>
                <span className="text-[10px] text-gold tracking-widest border border-gold/30 px-2 py-0.5 rounded-full whitespace-nowrap">{m.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-card py-20 mt-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gold text-sm tracking-widest mb-2">✦ THE RITUAL ✦</p>
            <h2 className="font-serif text-3xl md:text-4xl">A Six-Step <span className="text-gold italic">Cleansing Ceremony</span></h2>
          </div>
          <ol className="space-y-5">
            {ritual.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-5 glass-card rounded-xl p-5"
              >
                <div className="shrink-0 w-10 h-10 rounded-full border border-gold/40 bg-gold/10 text-gold font-serif flex items-center justify-center">
                  {i + 1}
                </div>
                <p className="text-muted-foreground pt-2">{step}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <AlertTriangle className="w-8 h-8 text-gold mx-auto mb-3" />
          <h2 className="font-serif text-3xl md:text-4xl">Stones That Need <span className="text-gold italic">Special Care</span></h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">Not every crystal can endure every method. Consult this chart before cleansing delicate stones.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safety.map((s, i) => (
            <motion.div
              key={s.stone}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border border-border rounded-xl p-5 bg-secondary/30"
            >
              <h3 className="font-serif text-lg text-gold mb-1">{s.stone}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.warn}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 text-center pb-10">
        <div className="glass-card rounded-2xl p-10 md:p-14">
          <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
          <h2 className="font-serif text-3xl md:text-4xl mb-3">Begin with a <span className="text-gold italic">Selenite Plate</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">The single most useful tool a crystal keeper can own. Cleanses passively — set any stone on it overnight to renew.</p>
          <Link href="/shop" className="gold-gradient text-primary-foreground px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            Shop Cleansing Tools →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CrystalCarePage;