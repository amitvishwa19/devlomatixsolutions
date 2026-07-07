"use client"
import Link from "next/link";
import { ArrowLeft, X, Star, Check, Minus, Heart, ShoppingCart, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { products } from "../_data/products";
import { useCompare } from "../_contexts/CompareContext";
import { useCart } from "../_contexts/CartContext";
import { useWishlist } from "../_contexts/WishlistContext";
import { useCurrency } from "../_contexts/CurrencyContext";

const ComparePage = () => {
  const { ids, remove, clear } = useCompare();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { format } = useCurrency();
  const items = products.filter((p) => ids.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Scale className="w-12 h-12 text-gold mx-auto mb-4" />
          <h1 className="font-serif text-3xl md:text-4xl mb-3">Compare <span className="text-gold italic">Crystals</span></h1>
          <p className="text-muted-foreground mb-8">Add up to 3 crystals from the shop to see them side-by-side.</p>
          <Link href="/shop" className="gold-gradient text-primary-foreground px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  const rows = [
    { label: "Price", render: (p) => <span className="text-gold font-semibold">{format(p.price)}</span> },
    { label: "Original Price", render: (p) => p.originalPrice ? <span className="text-muted-foreground line-through">{format(p.originalPrice)}</span> : <Minus className="w-4 h-4 text-muted-foreground" /> },
    { label: "Category", render: (p) => p.category },
    { label: "Rating", render: (p) => (
      <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 text-gold fill-current" />{p.rating} ({p.reviews})</span>
    )},
    { label: "In Stock", render: (p) => p.inStock ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-destructive" /> },
    { label: "Tags", render: (p) => (
      <div className="flex flex-wrap gap-1 justify-center">
        {(p.tags || []).map((t) => <span key={t} className="text-[10px] uppercase tracking-wider border border-gold/40 bg-gold/10 text-gold px-2 py-0.5 rounded-full">{t}</span>)}
      </div>
    )},
    { label: "Description", render: (p) => <span className="text-xs text-muted-foreground leading-relaxed">{p.description}</span> },
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div>
            <p className="text-gold text-xs tracking-widest mb-1">✦ SIDE BY SIDE ✦</p>
            <h1 className="font-serif text-3xl md:text-4xl">Compare <span className="text-gold italic">Crystals</span></h1>
          </div>
          <button onClick={clear} className="text-sm text-muted-foreground hover:text-destructive">Clear all</button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr>
                <th className="w-32 text-left text-xs uppercase tracking-widest text-muted-foreground font-normal pb-4"></th>
                {items.map((p) => (
                  <th key={p.id} className="p-3 align-top">
                    <div className="glass-card rounded-xl p-4 relative">
                      <button
                        onClick={() => remove(p.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-destructive hover:text-white"
                        aria-label="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <Link href={`/product/${p.id}`}>
                        <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                        <h3 className="font-serif font-semibold text-sm hover:text-gold transition-colors text-center">{p.name}</h3>
                      </Link>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => addToCart(p, 1)} className="flex-1 gold-gradient text-primary-foreground py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1 hover:opacity-90"><ShoppingCart className="w-3 h-3" /> Add</button>
                        <button onClick={() => toggleWishlist(p.id)} className="w-8 h-8 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                          <Heart className={`w-3.5 h-3.5 ${isWishlisted(p.id) ? "text-gold fill-current" : "text-muted-foreground"}`} />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={r.label} className={ri % 2 === 0 ? "bg-secondary/30" : ""}>
                  <td className="text-xs uppercase tracking-widest text-gold font-medium px-3 py-4 align-top">{r.label}</td>
                  {items.map((p) => (
                    <td key={p.id} className="text-sm px-3 py-4 text-center align-top">{r.render(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
};

export default ComparePage;