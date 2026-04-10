'use client';

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "../_context/CrystalAuraProviders";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const router = useRouter();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="bg-background border-white/10 w-full sm:max-w-md flex flex-col p-0 overflow-hidden">
        <SheetHeader className="p-6 border-b border-white/5">
          <SheetTitle className="font-serif text-2xl text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-6">
            <div>
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-light">Your cart is empty</p>
              <p className="text-muted-foreground/60 text-sm font-light mt-1">Add some sacred treasures</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 p-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 bg-white/5 border border-white/5 rounded-xl p-3">
                  <div className="w-20 h-20 relative rounded-md overflow-hidden bg-muted">
                     <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="object-cover w-full h-full"
                      />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                        <h4 className="font-serif text-foreground text-sm truncate">{item.product.title}</h4>
                        <p className="text-primary text-sm font-serif">₹{item.product.priceNum}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors bg-white/5"
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-foreground text-sm w-4 text-center">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors bg-white/5"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="ml-auto text-muted-foreground/40 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.02] space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-muted-foreground font-sans text-xs uppercase tracking-widest">Subtotal</span>
                <span className="text-foreground font-serif text-2xl font-semibold">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-muted-foreground/40 text-[10px] font-light uppercase tracking-widest">Free shipping on orders above ₹999</p>
              <Button
                onClick={() => { setIsOpen(false); router.push("/crystalaura/checkout"); }}
                className="w-full bg-gold-gradient text-white font-sans tracking-[0.2em] font-black uppercase text-[10px] py-6 rounded-xl hover:opacity-90 transition-opacity"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
