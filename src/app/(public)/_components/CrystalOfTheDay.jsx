"use client"
import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { products } from "../_data/products";
import { useCurrency } from "../_contexts/CurrencyContext";

// Deterministic pick per day so it's stable for everyone for the day
const dayIndex = () => {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const messages = [
  "Carry its energy with you today.",
  "Let this stone guide your intentions.",
  "Aligns beautifully with today's vibration.",
  "A perfect companion for grounding & clarity.",
  "Today's frequency is calling you.",
];

const CrystalOfTheDay = () => {
  const { format } = useCurrency();
  const { product, message } = useMemo(() => {
    const i = dayIndex();
    return {
      product: products[i % products.length],
      message: messages[i % messages.length],
    };
  }, []);

  if (!product) return null;

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
        >
          <div className="relative h-72 md:h-auto overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-gold/40 px-3 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-xs tracking-widest text-gold uppercase">Crystal of the Day</span>
            </div>
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <p className="text-gold text-xs tracking-widest mb-2">
              ✦ {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mb-3">
              <span className="text-gold italic">Today's</span> Sacred Stone
            </h2>
            <h3 className="font-serif text-xl md:text-2xl mb-3">{product.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{message}</p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">{product.description}</p>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-bold text-gold">{format(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">{format(product.originalPrice)}</span>
              )}
            </div>
            <Link
              href={`/product/${product.id}`}
              className="gold-gradient text-primary-foreground px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity self-start"
            >
              Discover Today's Crystal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CrystalOfTheDay;
