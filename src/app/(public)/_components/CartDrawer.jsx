'use client';

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "../_context/CrystalAuraProviders";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const router = useRouter();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="crystal-aura bg-background border-white/10 w-full sm:max-w-md flex flex-col p-0 overflow-hidden">
        <SheetHeader className="p-6 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <SheetTitle className="font-serif text-2xl text-foreground flex items-center gap-3 relative z-10">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <div className="absolute inset-0 blur-sm bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="shimmer-text font-semibold">Your Cart</span>
            <span className="text-muted-foreground text-base font-light">({totalItems})</span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-6 relative">
            <div className="absolute inset-0 noise-overlay" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10"
            >
              <div className="relative inline-block mb-6">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/20" />
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-primary/40" />
              </div>
              <p className="text-foreground font-serif text-xl mb-2">Your cart is empty</p>
              <p className="text-muted-foreground text-sm font-light">Add some sacred treasures to begin your journey</p>
            </motion.div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 p-6 relative">
              <div className="absolute inset-0 noise-overlay pointer-events-none" />
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 glass-card rounded-xl p-3 relative group"
                  >
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-muted/30">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="font-serif text-foreground text-sm truncate group-hover:text-primary transition-colors duration-300">
                          {item.product.title}
                        </h4>
                        <p className="text-primary text-lg font-serif font-semibold mt-1">₹{item.product.priceNum.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/10 transition-all duration-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-foreground text-sm w-6 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/10 transition-all duration-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="ml-auto text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-6 border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-background relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center px-1">
                  <span className="text-muted-foreground font-sans text-xs">Subtotal</span>
                  <span className="text-foreground font-serif text-2xl font-semibold shimmer-text">₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-muted-foreground/40 text-xs font-light flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary/50" />
                  Free shipping on orders above ₹999
                </p>
                <Button
                  onClick={() => { setIsOpen(false); router.push("/crystalaura/checkout"); }}
                  className="w-full bg-gold-gradient text-white font-medium text-sm py-6 rounded-xl hover:bg-gold-gradient-hover transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group"
                >
                  <span className="relative z-10">Proceed to Checkout</span>
                  <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
