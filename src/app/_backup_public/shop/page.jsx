"use client"
import Link from "next/link";
import { ArrowRight, Search, Heart, ShoppingCart, SlidersHorizontal, X, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { products, categories } from "../_data/products";
import { useWishlist } from "../_contexts/WishlistContext";
import { useCart } from "../_contexts/CartContext";
import { useCompare } from "../_contexts/CompareContext";
import { useCurrency } from "../_contexts/CurrencyContext";
import { ProductCardSkeleton } from "../_components/Skeleton";
import SEO from "../_components/SEO";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const filterTabs = ["All Products", "Crystals", "Jewelry", "Meditation", "Vastu"];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest Arrivals" },
];

const PRICE_MIN = 0;
const PRICE_MAX = 5000;

const ShopPage = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Products");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();
  const { has: inCompare, toggle: toggleCompare, isFull } = useCompare();
  const { format } = useCurrency();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeTab === "All Products" || p.category === activeTab;
      const matchesPrice = p.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "newest": list = [...list].reverse(); break;
      default: break;
    }
    return list;
  }, [search, activeTab, sort, maxPrice]);

  const reset = () => { setSearch(""); setActiveTab("All Products"); setSort("featured"); setMaxPrice(PRICE_MAX); };
  const filtersActive = search || activeTab !== "All Products" || sort !== "featured" || maxPrice !== PRICE_MAX;

  return (
    <div className="pt-20">
      <SEO
        title="Shop Crystals & Gemstones"
        description="Browse our full collection of authentic healing crystals, gemstones, jewelry and meditation tools. Free shipping pan-India."
        path="/shop"
      />
      <section className="py-16 text-center">
        <p className="text-gold text-sm mb-2">✦ Browse Our Collection ✦</p>
        <h1 className="font-serif text-5xl md:text-7xl mb-4"><span className="text-gold italic">Sacred</span> Shop</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Explore our curated collection of authentic healing crystals, gemstones, and spiritual tools.</p>
        <div className="w-20 h-1 bg-gold mx-auto mt-6 rounded-full" />
      </section>
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="relative max-w-lg mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search crystals, bracelets, pyramids..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {filterTabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? "Hide" : "Show"} filters
            {filtersActive && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
          </button>
          <p className="text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? "result" : "results"}</p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-xs text-muted-foreground">Sort by</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold/50"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="glass-card rounded-xl p-5 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-xs text-gold tracking-widest">PRICE RANGE</label>
                <span className="text-sm font-medium">₹{PRICE_MIN.toLocaleString()} – ₹{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[hsl(var(--gold))] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>₹0</span><span>₹2,500</span><span>₹5,000+</span>
              </div>
            </div>
            <div className="flex items-end justify-end">
              {filtersActive && (
                <button onClick={reset} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
                  <X className="w-4 h-4" /> Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04 }}>
              <Link href={`/product/${product.id}`} className="group block glass-card rounded-xl overflow-hidden hover:border-primary/30 transition-all">
                <div className="relative overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }} className="absolute top-3 left-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors">
                    <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? "text-gold fill-current" : "text-muted-foreground hover:text-gold"}`} />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(product.id); }}
                    disabled={!inCompare(product.id) && isFull}
                    title={inCompare(product.id) ? "Remove from compare" : isFull ? "Compare list full (3 max)" : "Add to compare"}
                    className={`absolute top-12 left-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${inCompare(product.id) ? "text-gold" : "text-muted-foreground hover:text-gold"}`}
                    aria-label="Compare"
                  >
                    <Scale className="w-4 h-4" />
                  </button>
                  <span className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-gold text-xs px-3 py-1 rounded-full font-medium">{format(product.price)}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-semibold">{product.name}</h3>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); }}
                      className="shrink-0 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-gold hover:text-primary-foreground transition-colors text-muted-foreground"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="font-serif text-xl">No products found</p>
            <p className="text-sm mt-2">Try adjusting your search, category, or price range</p>
            <button onClick={reset} className="mt-4 text-gold text-sm hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;