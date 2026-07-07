"use client"
import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Heart, ShoppingCart } from "lucide-react";
import { products } from "../_data/products";
import { useRecentlyViewed } from "../_hooks/useRecentlyViewed";
import { useWishlist } from "../_contexts/WishlistContext";
import { useCart } from "../_contexts/CartContext";
import { useCurrency } from "../_contexts/CurrencyContext";

// Recommend based on categories/tags of recently viewed + wishlisted items
const PersonalizedPicks = () => {
  const { ids: recentIds } = useRecentlyViewed();
  const { wishlistIds } = useWishlist();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { format } = useCurrency();

  const picks = useMemo(() => {
    const sourceIds = [...recentIds, ...wishlistIds];
    if (sourceIds.length === 0) return [];
    const sources = products.filter((p) => sourceIds.includes(p.id));
    const cats = new Set(sources.map((p) => p.category));
    const tags = new Set(sources.flatMap((p) => p.tags || []));

    const scored = products
      .filter((p) => !sourceIds.includes(p.id))
      .map((p) => {
        let score = 0;
        if (cats.has(p.category)) score += 3;
        (p.tags || []).forEach((t) => { if (tags.has(t)) score += 1; });
        score += p.rating / 5;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((s) => s.p);
    return scored;
  }, [recentIds, wishlistIds]);

  if (picks.length === 0) return null;

  return (
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Compass className="w-7 h-7 text-gold mx-auto mb-2" />
          <p className="text-gold text-xs tracking-widest mb-1">✦ JUST FOR YOU ✦</p>
          <h2 className="font-serif text-3xl md:text-4xl">
            <span className="text-gold italic">Personalized</span> Picks
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Curated based on your browsing & favorites — refreshed as you explore.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {picks.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl overflow-hidden group flex flex-col"
            >
              <div className="relative">
                <Link href={`/product/${p.id}`}>
                  <img src={p.image} alt={p.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                </Link>
                <button
                  onClick={() => toggleWishlist(p.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center"
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted(p.id) ? "text-gold fill-current" : "text-muted-foreground"}`} />
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <Link href={`/product/${p.id}`} className="font-serif text-sm font-semibold hover:text-gold transition-colors line-clamp-1">{p.name}</Link>
                <p className="text-gold text-sm mt-1">{format(p.price)}</p>
                <button
                  onClick={() => addToCart(p, 1)}
                  className="mt-3 border border-gold/40 text-gold py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-gold/10 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonalizedPicks;
