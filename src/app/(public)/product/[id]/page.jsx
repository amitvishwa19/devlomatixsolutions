"use client"
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Heart, ShoppingCart, Minus, Plus, Star, Truck, Shield, RotateCcw, ZoomIn, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { products } from "../../_data/products";
import { useCart } from "../../_contexts/CartContext";
import { useWishlist } from "../../_contexts/WishlistContext";
import { useCompare } from "../../_contexts/CompareContext";
import { useCurrency } from "../../_contexts/CurrencyContext";
import { ProductDetailSkeleton } from "../../_components/Skeleton";
import StockUrgency from "../../_components/StockUrgency";
import ProductReviews from "../../_components/ProductReviews";
import RecentlyViewed from "../../_components/RecentlyViewed";
import { useRecentlyViewed } from "../../_hooks/useRecentlyViewed";
import SEO from "../../_components/SEO";

const ProductDetailPage = () => {
  const params = useParams();
  const id = params.id;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { has: inCompare, toggle: toggleCompare, isFull } = useCompare();
  const { format } = useCurrency();
  const { track } = useRecentlyViewed();

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [id]);

  useEffect(() => {
    if (product) track(product.id);
  }, [product, track]);

  const bundle = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.category === product.category)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2);
  }, [product]);

  if (!product) {
    return (
      <div className="pt-24 pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/shop" className="gold-gradient text-primary-foreground px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2">
            Back to Shop <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleZoom = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (loading) return <ProductDetailSkeleton />;

  return (
    <div className="pt-20 pb-20">
      <SEO
        title={product.name}
        description={product.description}
        path={`/product/${product.id}`}
        image={product.image}
      />
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mt-6 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="relative">
            <div
              ref={imageRef}
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
              onMouseMove={handleZoom}
              className="relative overflow-hidden rounded-2xl bg-card"
            >
              <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
              {zoomActive && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${product.image})`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundSize: "200%",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors ${
                  isWishlisted(product.id)
                    ? "bg-gold/10 border-gold text-gold"
                    : "border-border hover:border-gold/50"
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={() => toggleCompare(product.id)}
                disabled={!inCompare(product.id) && isFull}
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors disabled:opacity-50 ${
                  inCompare(product.id)
                    ? "bg-gold/10 border-gold text-gold"
                    : "border-border hover:border-gold/50"
                }`}
              >
                <Scale className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs text-gold uppercase tracking-widest">{product.category}</span>
            <h1 className="font-serif text-3xl md:text-4xl mt-2 mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < product.rating ? "text-gold fill-current" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl text-gold font-semibold">{format(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{format(product.originalPrice)}</span>
                  <span className="text-sm text-green-400">−{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
                </>
              )}
            </div>

            <p className="text-muted-foreground mb-6">{product.description}</p>

            <StockUrgency product={product} />

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-secondary">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-secondary">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 gold-gradient text-primary-foreground py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders above ₹999</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-sm font-medium">Authenticity Verified</p>
                  <p className="text-xs text-muted-foreground">Certified crystals</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-sm font-medium">Compare</p>
                  <p className="text-xs text-muted-foreground">Add to compare</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProductReviews product={product} />

        {bundle.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl mb-6">Complete the Set</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bundle.map((item) => (
                <div key={item.id} className="glass-card rounded-xl p-4 flex gap-4">
                  <Link href={`/product/${item.id}`}>
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                  </Link>
                  <div>
                    <Link href={`/product/${item.id}`} className="font-serif font-medium hover:text-gold">{item.name}</Link>
                    <p className="text-gold font-semibold mt-1">{format(item.price)}</p>
                    <button onClick={() => addToCart(item, 1)} className="text-sm text-gold mt-2 hover:underline">Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <RecentlyViewed />
      </div>
    </div>
  );
};

export default ProductDetailPage;