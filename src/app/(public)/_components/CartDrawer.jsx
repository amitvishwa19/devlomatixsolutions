"use client"
import { useState } from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, Tag, Check } from "lucide-react";
import { useCart } from "../_contexts/CartContext";
import { useCurrency } from "../_contexts/CurrencyContext";
import { motion, AnimatePresence } from "framer-motion";

const PROMO_CODES = {
  AURA10: { type: "percent", value: 10, label: "10% off" },
  WELCOME100: { type: "flat", value: 100, label: "₹100 off" },
  CRYSTAL20: { type: "percent", value: 20, label: "20% off" },
};

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const { format } = useCurrency();
  const [promoInput, setPromoInput] = useState("");
  const [applied, setApplied] = useState(null);
  const [error, setError] = useState("");

  const apply = () => {
    const code = promoInput.trim().toUpperCase();
    setError("");
    if (!code) return setError("Enter a code");
    const promo = PROMO_CODES[code];
    if (!promo) { setApplied(null); return setError("Invalid code"); }
    setApplied({ code, ...promo });
  };

  const discount = applied
    ? applied.type === "percent"
      ? Math.round((totalPrice * applied.value) / 100)
      : Math.min(applied.value, totalPrice)
    : 0;
  const subtotalAfter = Math.max(0, totalPrice - discount);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-xl">Your Cart ({totalItems})</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <p className="font-serif text-lg mb-2">Your cart is empty</p>
                  <p className="text-sm">Discover our sacred collection</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 glass-card rounded-lg p-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                      <p className="text-gold text-sm mt-1">{format(item.product.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center border border-border rounded text-xs hover:bg-secondary"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center border border-border rounded text-xs hover:bg-secondary"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-3">
                {/* Coupon */}
                <div>
                  {applied ? (
                    <div className="flex items-center justify-between bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="font-medium">{applied.code}</span>
                        <span className="text-muted-foreground text-xs">({applied.label})</span>
                      </span>
                      <button onClick={() => { setApplied(null); setPromoInput(""); }} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => { setPromoInput(e.target.value); setError(""); }}
                            placeholder="Coupon code"
                            className="w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <button onClick={apply} className="px-4 py-2 rounded-lg text-sm font-medium border border-gold text-gold hover:bg-gold/10 transition-colors">Apply</button>
                      </div>
                      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
                    </>
                  )}
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{format(totalPrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-400">−{format(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-gold font-semibold">{format(subtotalAfter)}</span>
                </div>
                {totalPrice >= 999 && (
                  <p className="text-xs text-green-400">✓ Free shipping on this order!</p>
                )}
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full gold-gradient text-primary-foreground text-center py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
