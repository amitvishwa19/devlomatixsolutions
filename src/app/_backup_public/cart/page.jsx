"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "../_contexts/CartContext";
import { useCurrency } from "../_contexts/CurrencyContext";
import SEO from "../_components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const CartPage = () => {
  const pathname = usePathname();
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { format } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Discover our sacred collection</p>
          <Link href="/shop" className="gold-gradient text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  const shipping = totalPrice >= 999 ? 0 : 99;
  const grandTotal = totalPrice + shipping;

  return (
    <div className="pt-20 pb-20">
      <SEO title="Shopping Cart" description="Your cart items" path="/cart" />
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mt-6 mb-6">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl mb-8"><span className="text-gold">Shopping</span> Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="glass-card rounded-xl p-4 flex gap-4">
                  <Link href={`/product/${item.product.id}`}>
                    <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-lg" />
                  </Link>
                  <div className="flex-1">
                    <Link href={`/product/${item.product.id}`} className="font-serif font-medium hover:text-gold">{item.product.name}</Link>
                    <p className="text-gold font-semibold mt-1">{format(item.product.price)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-border rounded-lg">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-secondary">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-secondary">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{format(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <h2 className="font-serif text-xl mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{format(totalPrice)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? "text-green-400" : ""}>{shipping === 0 ? "FREE" : format(shipping)}</span></div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border"><span>Total</span><span className="text-gold">{format(grandTotal)}</span></div>
              </div>
              <Link href="/checkout" className="mt-6 w-full gold-gradient text-primary-foreground py-3 rounded-lg font-medium inline-flex items-center justify-center hover:opacity-90 transition-opacity">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;