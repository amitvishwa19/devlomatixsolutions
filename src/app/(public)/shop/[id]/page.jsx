'use client';

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "../../_data/products";
import { useCart, useWishlist } from "../../_context/CrystalAuraProviders";
import ProductCard from "../../_components/ProductCard";
import { toast } from "sonner";

// Inline SVG Icons
const ArrowLeftIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
);

const ShoppingBagIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

const ShieldIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

const TruckIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
);

const SparklesIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

const MinusIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

const PlusIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

const HeartIcon = ({ className = "w-4 h-4", fill = "none" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);

const ShareIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
);

const StarIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);

export default function CrystalAuraProductDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params.id;
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#06040a] flex items-center justify-center p-6">
        <div className="text-center p-12 glass-card rounded-3xl max-w-lg border border-white/5">
          <ShoppingBagIcon className="w-16 h-16 text-muted-foreground/25 mx-auto mb-6" />
          <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">Sacred Curation Not Found</h1>
          <p className="text-xs text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
            The treasure you seek might have been cataloged under a different designation or returned to the earth.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl px-8 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-lg shadow-primary/5"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Shop</span>
          </Link>
        </div>
      </div>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ ...product, priceNum: product.priceNum || product.price });
    }
    toast.success(`${quantity}x ${product.name} added to cart!`);
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    const wish = isWishlisted(product.id);
    if (wish) {
      toast.success(`${product.name} removed from wishlist.`);
    } else {
      toast.success(`${product.name} saved to wishlist!`);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, text: product.description, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Product link copied to clipboard!");
    }
  };

  const fakeReviews = [
    { name: "Priya S.", rating: 5, text: "Beautiful quality! The energy from this crystal is amazing. Highly recommended.", date: "2 weeks ago" },
    { name: "Rahul M.", rating: 4, text: "Good product, arrived well-packaged. Slightly smaller than expected but great quality.", date: "1 month ago" },
    { name: "Ananya K.", rating: 5, text: "Absolutely love it! The craftsmanship is excellent and it feels very genuine.", date: "3 weeks ago" },
  ];

  const avgRating = 4.8;
  const priceVal = product.priceNum || product.price;

  return (
    <div className="min-h-screen bg-[#06040a] pt-32 pb-24 text-foreground font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold text-muted-foreground mb-12">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="opacity-30">/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span className="opacity-30">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Details Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
          
          {/* Left Column: Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="sticky top-32"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-6 left-6 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-[9px] tracking-widest font-black uppercase shadow-lg">
                {product.category}
              </span>
            </div>
          </motion.div>

          {/* Right Column: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col pt-4"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-snug mb-4">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1 text-primary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} className="w-3.5 h-3.5" />
                ))}
              </div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground">
                {avgRating} ({fakeReviews.length} reviews)
              </span>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-serif font-bold text-foreground">₹{priceVal.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-sm line-through text-muted-foreground/60">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-8 max-w-xl">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-6 mb-8">
              <span className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground">Quantity</span>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
                <span className="w-10 text-center font-mono font-bold text-xs">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-grow bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-lg shadow-primary/5 flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                <span>Add to Cart — ₹{(priceVal * quantity).toLocaleString()}</span>
              </button>

              <button
                onClick={handleWishlist}
                className={`w-14 rounded-xl border flex items-center justify-center transition-all duration-300 active:scale-95 ${
                  isWishlisted(product.id)
                    ? "bg-primary/20 border-primary/30 text-primary"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Toggle Wishlist"
              >
                <HeartIcon className="w-5 h-5" fill={isWishlisted(product.id) ? "currentColor" : "none"} />
              </button>

              <button
                onClick={handleShare}
                className="w-14 rounded-xl border bg-white/5 border-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all duration-300 active:scale-95"
                aria-label="Share product"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: ShieldIcon, label: "100% Authentic" },
                { icon: TruckIcon, label: "Free Shipping ₹999+" },
                { icon: SparklesIcon, label: "Energized" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-primary">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] tracking-widest text-muted-foreground uppercase font-bold leading-tight">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 text-[9px] tracking-widest uppercase font-bold text-muted-foreground bg-white/5 border border-white/10 px-4 py-2.5 rounded-full w-fit">
              <CheckIcon className="w-3.5 h-3.5 text-green-400" />
              <span>In Stock — Ships within 24 hours</span>
            </div>

          </motion.div>
        </div>

        {/* Tabs Detailed Section */}
        <div className="border-t border-white/5 pt-16 max-w-4xl mx-auto mb-24">
          <div className="flex justify-center border-b border-white/5 mb-8">
            {[
              { id: "description", label: "Energy & Properties" },
              { id: "reviews", label: `Reviews (${fakeReviews.length})` }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`pb-4 px-6 text-[10px] tracking-widest uppercase font-bold transition-all border-b-2 -mb-[2px] ${
                  activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "description" ? (
              <motion.div
                key="desc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-xs md:text-sm text-muted-foreground leading-relaxed flex flex-col gap-4"
              >
                <p>
                  Every crystal holds a distinct geometric lattice that resonates with a unique vibrational signature. This natural alignment helps absorb, redirect, or balance spatial frequencies surrounding your energy field.
                </p>
                <p>
                  Our gemstones are hand-sourced directly from ethical minerals sites globally, gently cleansed using Tibetan copper singing bowls and high-vibration sage smoke before packaging to ensure pure integration with your space.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col gap-4"
              >
                {fakeReviews.map((r, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm font-bold text-foreground">{r.name}</span>
                      <span className="text-[10px] text-muted-foreground">{r.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      {[...Array(r.rating)].map((_, starIdx) => (
                        <StarIcon key={starIdx} className="w-3 h-3" />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{r.text}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related Products Carousel */}
        {related.length > 0 && (
          <div className="border-t border-white/5 pt-16">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-8 text-center">
              Related <span className="shimmer-text italic font-normal">Curations</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  image={p.image}
                  title={p.name}
                  description={p.category}
                  price={p.priceNum || p.price}
                  delay={idx * 0.05}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
