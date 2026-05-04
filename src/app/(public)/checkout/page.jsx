"use client"
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ArrowLeft, Minus, Plus, Tag, Check, Gift } from "lucide-react";
import { useCart } from "../_contexts/CartContext";
import { useCurrency } from "../_contexts/CurrencyContext";
import TrustSeals from "../_components/TrustSeals";

const GIFT_WRAP_FEE = 99;

const CheckoutPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { format } = useCurrency();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "",
  });
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  const PROMO_CODES = {
    AURA10: { type: "percent", value: 10, label: "10% off" },
    WELCOME100: { type: "flat", value: 100, label: "₹100 off" },
    CRYSTAL20: { type: "percent", value: 20, label: "20% off" },
  };

  const discount = appliedPromo
    ? appliedPromo.type === "percent"
      ? Math.round((totalPrice * appliedPromo.value) / 100)
      : Math.min(appliedPromo.value, totalPrice)
    : 0;

  const giftFee = giftWrap ? GIFT_WRAP_FEE : 0;
  const shipping = totalPrice >= 999 ? 0 : 99;
  const grandTotal = Math.max(0, totalPrice - discount) + shipping + giftFee;

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    setPromoError("");
    if (!code) {
      setPromoError("Enter a promo code");
      return;
    }
    const promo = PROMO_CODES[code];
    if (!promo) {
      setPromoError("Invalid promo code");
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo({ code, ...promo });
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderData = {
      items: items.map((item) => ({ name: item.product.name, quantity: item.quantity, price: item.product.price })),
      total: grandTotal, shipping, form: { name: form.name, email: form.email },
    };
    clearCart();
    router.push("/order-confirmation");
  };

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Discover our sacred collection</p>
          <Link href="/shop" className="gold-gradient text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">Browse Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl mb-8"><span className="text-gold">Checkout</span></h1>
        <TrustSeals />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-5">
              <h2 className="font-serif text-xl mb-4">Shipping Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-muted-foreground tracking-wider mb-1 block">FULL NAME</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground tracking-wider mb-1 block">EMAIL</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground tracking-wider mb-1 block">PHONE</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground tracking-wider mb-1 block">ADDRESS</label>
                <textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs text-muted-foreground tracking-wider mb-1 block">CITY</label>
                  <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground tracking-wider mb-1 block">STATE</label>
                  <input type="text" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground tracking-wider mb-1 block">PINCODE</label>
                  <input type="text" required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>

              <div className="border border-border rounded-xl p-4 bg-secondary/30">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[hsl(var(--gold))]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-gold" />
                      <span className="text-sm font-medium">Add gift wrapping</span>
                      <span className="text-xs text-muted-foreground">+{format(GIFT_WRAP_FEE)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Hand-wrapped in silk pouch with a personalized note card.</p>
                  </div>
                </label>
                {giftWrap && (
                  <div className="mt-3">
                    <label className="text-xs text-muted-foreground tracking-wider mb-1 block">GIFT MESSAGE (OPTIONAL)</label>
                    <textarea
                      rows={3}
                      maxLength={200}
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Wishing you healing energy and abundance ✦"
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1 text-right">{giftMessage.length}/200</p>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full gold-gradient text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity mt-4">
                Place Order — {format(grandTotal)}
              </button>
            </form>
          </div>
          <div>
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <h2 className="font-serif text-xl mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-gold">{format(item.product.price)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center border border-border rounded text-xs"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center border border-border rounded text-xs"><Plus className="w-3 h-3" /></button>
                        <button onClick={() => removeFromCart(item.product.id)} className="ml-auto text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{format(totalPrice)}</span></div>

                <div className="pt-3 pb-1">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-secondary border border-border rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="font-medium">{appliedPromo.code}</span>
                        <span className="text-muted-foreground text-xs">({appliedPromo.label})</span>
                      </div>
                      <button type="button" onClick={removePromo} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                            placeholder="Promo code"
                            maxLength={20}
                            className="w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <button type="button" onClick={applyPromo} className="px-4 py-2 rounded-lg text-sm font-medium gold-gradient text-primary-foreground hover:opacity-90 transition-opacity">Apply</button>
                      </div>
                      {promoError && <p className="text-xs text-destructive mt-1">{promoError}</p>}
                      <p className="text-[11px] text-muted-foreground mt-2">Try AURA10, WELCOME100 or CRYSTAL20</p>
                    </>
                  )}
                </div>

                {discount > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-green-400">−{format(discount)}</span></div>
                )}
                {giftWrap && (
                  <div className="flex justify-between"><span className="text-muted-foreground inline-flex items-center gap-1"><Gift className="w-3 h-3 text-gold" /> Gift wrap</span><span>{format(GIFT_WRAP_FEE)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? "text-green-400" : ""}>{shipping === 0 ? "FREE" : format(shipping)}</span></div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border"><span>Total</span><span className="text-gold">{format(grandTotal)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;