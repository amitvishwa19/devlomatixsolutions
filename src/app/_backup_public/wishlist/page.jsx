"use client"
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, Eye, X, Star } from "lucide-react";
import { products } from "../_data/products";
import { useWishlist } from "../_contexts/WishlistContext";
import { useCart } from "../_contexts/CartContext";
import SEO from "../_components/SEO";

const WishlistPage = () => {
  const { wishlistIds, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [quickView, setQuickView] = useState(null);

  const items = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <SEO title="My Wishlist" description="Save your favorite crystals and gemstones for later." path="/wishlist" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-gold text-sm mb-2">✦ Saved For Later ✦</p>
            <h1 className="font-serif text-4xl md:text-5xl"><span className="text-gold italic">My</span> Wishlist</h1>
            <p className="text-muted-foreground mt-2 text-sm">{items.length} {items.length === 1 ? "crystal" : "crystals"} saved</p>
          </div>
          {items.length > 0 && (
            <button onClick={clearWishlist} className="text-sm text-muted-foreground hover:text-destructive border border-border hover:border-destructive px-4 py-2 rounded-lg transition-colors">
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="glass-card rounded-2xl py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Heart className="w-9 h-9 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-2xl mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">Tap the heart icon on any product to save it here for later.</p>
            <Link href="/shop" className="gold-gradient text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl overflow-hidden group flex flex-col"
              >
                <div className="relative overflow-hidden">
                  <Link href={`/product/${p.id}`}>
                    <img src={p.image} alt={p.name} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    aria-label="Remove from wishlist"
                    className="absolute top-3 right-3 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setQuickView(p)}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all bg-background/90 backdrop-blur-sm border border-border text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Quick View
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-[10px] text-gold uppercase tracking-wider">{p.category}</span>
                  <Link href={`/product/${p.id}`} className="font-serif font-semibold mt-1 hover:text-gold transition-colors line-clamp-1">{p.name}</Link>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-gold fill-current" />
                    <span className="text-xs text-muted-foreground">{p.rating} · {p.reviews}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-gold font-semibold">₹{p.price.toLocaleString()}</span>
                    {p.originalPrice && <span className="text-xs text-muted-foreground line-through">₹{p.originalPrice.toLocaleString()}</span>}
                  </div>
                  <button
                    onClick={() => addToCart(p, 1)}
                    className="mt-4 gold-gradient text-primary-foreground py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {quickView && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setQuickView(null)}
              className="fixed inset-0 bg-black/70 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass-card rounded-2xl max-w-3xl w-full pointer-events-auto overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
                <img src={quickView.image} alt={quickView.name} className="w-full h-64 md:h-full object-cover" />
                <div className="p-6 relative">
                  <button onClick={() => setQuickView(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                  <span className="text-xs text-gold uppercase tracking-wider">{quickView.category}</span>
                  <h3 className="font-serif text-2xl mt-1 mb-2">{quickView.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl text-gold font-semibold">₹{quickView.price.toLocaleString()}</span>
                    {quickView.originalPrice && <span className="text-sm text-muted-foreground line-through">₹{quickView.originalPrice.toLocaleString()}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{quickView.description}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { addToCart(quickView, 1); setQuickView(null); }}
                      className="flex-1 gold-gradient text-primary-foreground py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                    <Link
                      href={`/product/${quickView.id}`}
                      onClick={() => setQuickView(null)}
                      className="border border-gold text-gold px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold/10 transition-colors"
                    >
                      View Full
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WishlistPage;