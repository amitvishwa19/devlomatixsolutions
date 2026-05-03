'use client';

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { products } from "../../_data/products";
import { useCart, useWishlist, useRecentlyViewed } from "../../_context/CrystalAuraProviders";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, Shield, Truck, Sparkles, Minus, Plus, Heart, Share2, Star, Check } from "lucide-react";
import ProductCard from "../../_components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function CrystalAuraProductDetailPage() {
  const { id } = useParams();
  const { addItem, isInCart, getItemQuantity } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem: addToRecentlyViewed } = useRecentlyViewed();
  const { trackProductView, trackAddToCart } = useAnalytics();
  const { toast } = useToast();
  
  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (product) {
      addToRecentlyViewed(product);
      trackProductView(product.id, product.title, product.category, product.priceNum);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[#0a0a0a]">
        <div className="text-center p-12 glass-card rounded-3xl max-w-lg">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
          <h1 className="font-serif text-4xl text-foreground mb-6">Sacred Product Not Found</h1>
          <p className="text-muted-foreground font-light mb-8">The treasure you seek might have been moved or returned to the earth.</p>
          <Link href="/crystalaura/shop">
            <Button className="bg-gold-gradient text-white px-8 py-6 rounded-xl font-medium text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
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
      addItem(product);
    }
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.title} added to your cart`,
    });
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    toast({
      title: isWishlisted(product.id) ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted(product.id) ? `${product.title} removed` : `${product.title} saved`,
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.title, text: product.description, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Product link copied to clipboard" });
    }
  };

  const fakeReviews = [
    { name: "Priya S.", rating: 5, text: "Beautiful quality! The energy from this crystal is amazing. Highly recommended.", date: "2 weeks ago" },
    { name: "Rahul M.", rating: 4, text: "Good product, arrived well-packaged. Slightly smaller than expected but great quality.", date: "1 month ago" },
    { name: "Ananya K.", rating: 5, text: "Absolutely love it! The craftsmanship is excellent and it feels very genuine.", date: "3 weeks ago" },
  ];

  const avgRating = 4.7;

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-12">
          <Link href="/crystalaura" className="hover:text-primary transition-colors">Home</Link>
          <span className="opacity-30">/</span>
          <Link href="/crystalaura/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span className="opacity-30">/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 sticky top-32"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] group">
              <img
                src={product.image}
                alt={product.title}
                className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-6 left-6">
                <Badge className="bg-gold-gradient text-white border-none shadow-lg px-4 py-1.5 rounded-full text-xs font-medium">
                  {product.category}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col pt-4"
          >
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground font-semibold leading-tight mb-4">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(avgRating) ? "text-primary fill-primary" : "text-muted-foreground/20"}`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-xs font-medium">{avgRating} ({fakeReviews.length} reviews)</span>
            </div>

            <div className="flex items-baseline gap-4 mb-2">
              <p className="text-primary font-serif text-5xl md:text-6xl font-bold">{product.price}</p>
              <p className="text-muted-foreground/40 text-xs font-light">Inc. of all taxes</p>
            </div>

            <p className="text-muted-foreground font-light leading-relaxed text-lg mb-12 max-w-xl">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-8 mb-10">
              <span className="text-foreground text-xs font-medium">Quantity</span>
              <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-2xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-white/5"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-12 bg-transparent text-center text-foreground font-sans font-bold focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-white/5"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 min-w-[240px] bg-gold-gradient text-white font-medium text-sm py-8 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20"
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                Add to Cart — ₹{(product.priceNum * quantity).toLocaleString("en-IN")}
              </Button>
              <div className="flex gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleWishlist}
                    className={`h-[68px] w-[68px] rounded-2xl border-white/10 bg-white/[0.03] hover:bg-white/5 transition-all p-0 ${isWishlisted(product.id) ? "text-destructive border-destructive/30" : "text-muted-foreground"}`}
                >
                    <Heart className={`w-6 h-6 ${isWishlisted(product.id) ? "fill-destructive" : ""}`} />
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="h-[68px] w-[68px] rounded-2xl border-white/10 bg-white/[0.03] hover:bg-white/5 transition-all p-0 text-muted-foreground"
                >
                    <Share2 className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {[
                { icon: Shield, label: "100% Authentic" },
                { icon: Truck, label: "Free Shipping ₹999+" },
                { icon: Sparkles, label: "Charged" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-xs font-medium leading-tight">{f.label}</p>
                </div>
              ))}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3 text-xs font-medium bg-white/[0.03] w-fit px-6 py-3 rounded-full border border-white/5">
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-muted-foreground/60">In Stock — Ships within 2-3 days</span>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-32 max-w-4xl mx-auto"
        >
          <div className="flex border-b border-white/5 gap-12 justify-center mb-12">
            {[
              { id: "description", label: "Energy" },
              { id: "details", label: "Details" },
              { id: "reviews", label: `Reviews (${fakeReviews.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
className={`pb-6 text-sm font-medium transition-all border-b-2 -mb-[2px] ${
                      activeTab === tab.id
                        ? "text-primary border-primary"
                        : "text-muted-foreground/40 border-transparent hover:text-foreground"
                    }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 md:p-14 min-h-[300px] flex flex-col items-center text-center">
            {activeTab === "description" && (
              <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-muted-foreground font-light leading-[1.8] text-lg">
                  {product.longDescription}
                </p>
              </div>
            )}

            {activeTab === "details" && (
              <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  {[
                    ["Category", product.category.charAt(0).toUpperCase() + product.category.slice(1)],
                    ["Material", "Natural Gemstone"],
                    ["Origin", "India / Brazil"],
                    ["Care", "Cleanse under moonlight or with sage"],
                    ["Shipping", "Free above ₹999"],
                    ["Returns", "7-day easy returns"],
                  ].map(([key, value]) => (
                    <div key={key} className="flex justify-between py-5 border-b border-white/5 last:border-0">
                      <span className="text-muted-foreground/40 text-xs font-medium">{key}</span>
                      <span className="text-foreground text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center gap-4 pb-12 border-b border-white/5 mb-12">
                   <div className="text-center group">
                      <span className="font-serif text-8xl text-foreground font-semibold group-hover:text-gold-gradient transition-all">{avgRating}</span>
                      <div className="flex items-center gap-1.5 justify-center mt-2 group-hover:scale-110 transition-transform">
                        {[1, 2, 3, 4, 5].map((star) => (
                           <Star
                             key={star}
                             className={`w-4 h-4 ${star <= Math.round(avgRating) ? "text-primary fill-primary" : "text-muted-foreground/10"}`}
                           />
                         ))}
                      </div>
                      <p className="text-muted-foreground/40 text-xs font-medium mt-4">Based on {fakeReviews.length} reviews</p>
                   </div>
                </div>

                <div className="space-y-10 text-left">
                  {fakeReviews.map((review, i) => (
                    <div key={i} className="group pb-10 border-b border-white/5 last:border-0">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-serif text-xl font-bold">
                            {review.name[0]}
                          </div>
                          <div>
                            <span className="text-foreground text-sm font-medium">{review.name}</span>
                            <p className="text-muted-foreground/40 text-xs font-light mt-1">{review.location || "Verified Buyer"}</p>
                          </div>
                        </div>
                        <span className="text-muted-foreground/20 text-xs font-medium">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-6 opacity-60">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= review.rating ? "text-primary fill-primary" : "text-muted-foreground/10"}`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground font-light text-base leading-relaxed italic">
                        "{review.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-primary text-xs font-medium mb-4">
                Personal Guidance
              </p>
              <h2 className="font-serif text-4xl md:text-6xl text-foreground">
                You May Also <span className="text-gold-gradient font-bold">Like</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {related.map((p, i) => (
                <ProductCard key={p.id} {...p} delay={i * 0.1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
