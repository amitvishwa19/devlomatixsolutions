'use client';

import React, { useState } from "react";
import { useCart, useOrders, useTheme } from "../_context/CrystalAuraProviders";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { CreditCard, Wallet, Smartphone, Building2, Lock, Tag, CheckCircle2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "./_actions/createOrder";

const COUPONS = {
  CRYSTAL10: { discount: 10, type: "percent", label: "10% off" },
  SACRED20: { discount: 20, type: "percent", label: "20% off" },
  FLAT200: { discount: 200, type: "flat", label: "₹200 off" },
  WELCOME15: { discount: 15, type: "percent", label: "15% off (Welcome)" },
};

export default function CrystalAuraCheckoutPage() {
  const { items, totalPrice, clearCart, guestId } = useCart();
  const { addOrder } = useOrders();
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [form, setForm] = useState({
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "9876543210",
    address: "42, Crystal Lane, Sector 15",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/28",
    cardCvv: "123",
    upiId: "priya@upi",
  });

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const shipping = totalPrice >= 999 ? 0 : 99;
  const codCharge = paymentMethod === "cod" ? 49 : 0;
  const subtotalAfterDiscount = Math.max(0, totalPrice - couponDiscount);
  const total = subtotalAfterDiscount + shipping + codCharge;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const coupon = COUPONS[code];
    if (!coupon) {
      toast({ 
        title: "Invalid coupon", 
        description: "This coupon code doesn't exist. Try CRYSTAL10, SACRED20, or FLAT200.", 
        variant: "destructive" 
      });
      return;
    }
    const disc = coupon.type === "percent" ? Math.round(totalPrice * coupon.discount / 100) : coupon.discount;
    setCouponDiscount(disc);
    setAppliedCoupon(code);
    toast({ title: "Coupon applied!", description: `${coupon.label} — you save ₹${disc.toLocaleString("en-IN")}` });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
  };

  const handlePlaceOrder = async () => {
    if (!session?.user?.userId) {
      toast({ title: "Please sign in to place order", variant: "destructive" });
      return;
    }

    setProcessing(true);

    try {
      const orderItems = items.map(item => ({
        productId: item.product.id || item.id,
        title: item.product.title,
        price: item.product.priceNum || item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));

      const result = await createOrder({
        userId: session.user.userId,
        guestId: guestId,
        items: orderItems,
        shippingAddress: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon || undefined,
        discount: couponDiscount,
      });

      if (result.success) {
        // Also save to local context for quick access
        const localOrder = {
          id: result.order.id,
          items: result.order.items,
          total: result.order.total,
          date: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
          status: result.order.status,
          paymentMethod: paymentMethod === "card" ? "Credit/Debit Card" : paymentMethod === "upi" ? "UPI" : paymentMethod === "netbanking" ? "Net Banking" : "Cash on Delivery",
          shippingAddress: result.order.shippingAddress,
          discount: couponDiscount,
        };
        addOrder(localOrder);
        clearCart(true);
        router.push("/order-success");
      } else {
        console.error("[ORDER_FAILED]", result);
        toast({ title: "Order failed", description: result.error || "Unknown error", variant: "destructive" });
      }
    } catch (error) {
      console.error("[ORDER_ERROR]", error);
      toast({ title: "Order failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
       <div className="min-h-screen bg-transparent flex items-center justify-center p-6 bg-[#0a0a0a]">
        <div className="text-center p-12  rounded-3xl max-w-lg">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
          <h1 className="font-serif text-4xl text-foreground mb-6">Your Cart is Empty</h1>
          <p className="text-muted-foreground font-light mb-8">You haven't selected any sacred treasures yet.</p>
          <Link href="/shop">
            <Button className="bg-gold-gradient text-white px-8 py-6 rounded-xl font-sans tracking-widest uppercase font-black text-[10px]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, Rupay" },
    { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm" },
    { id: "netbanking", label: "Net Banking", icon: Building2, desc: "All major banks" },
    { id: "cod", label: "Cash on Delivery", icon: Wallet, desc: "Pay when you receive" },
  ];

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center gap-2 text-[10px] font-sans text-muted-foreground mb-12 uppercase tracking-[0.2em] font-black">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="opacity-30">/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span className="opacity-30">/</span>
          <span className="text-foreground">Checkout</span>
        </nav>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">Final Step</p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6">
            <span className="text-gold-gradient font-semibold">Sacred</span> Checkout
          </h1>
          <div className="section-divider w-48 mx-auto mt-8" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {/* Shipping */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className=" rounded-3xl p-10">
              <h2 className="font-serif text-3xl text-foreground mb-10">Shipping Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest px-1">Full Name</Label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} className="bg-white/[0.03] border-white/5 py-6 rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Label className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest px-1">Email</Label>
                  <Input value={form.email} onChange={(e) => update("email", e.target.value)} className="bg-white/[0.03] border-white/5 py-6 rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Label className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest px-1">Phone</Label>
                  <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="bg-white/[0.03] border-white/5 py-6 rounded-xl" />
                </div>
                <div className="space-y-3 sm:col-span-2">
                  <Label className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest px-1">Address</Label>
                  <Input value={form.address} onChange={(e) => update("address", e.target.value)} className="bg-white/[0.03] border-white/5 py-6 rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Label className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest px-1">City</Label>
                  <Input value={form.city} onChange={(e) => update("city", e.target.value)} className="bg-white/[0.03] border-white/5 py-6 rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Label className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest px-1">State</Label>
                  <Input value={form.state} onChange={(e) => update("state", e.target.value)} className="bg-white/[0.03] border-white/5 py-6 rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Label className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest px-1">PIN Code</Label>
                  <Input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} className="bg-white/[0.03] border-white/5 py-6 rounded-xl" />
                </div>
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className=" rounded-3xl p-10">
              <h2 className="font-serif text-3xl text-foreground mb-10">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {paymentMethods.map((pm) => (
                  <button 
                    key={pm.id} 
                    onClick={() => setPaymentMethod(pm.id)} 
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                      paymentMethod === pm.id 
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/5" 
                        : "border-white/5 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className={`p-4 rounded-xl ${paymentMethod === pm.id ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground/40"}`}>
                        <pm.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-[10px] uppercase font-black tracking-widest ${paymentMethod === pm.id ? "text-foreground" : "text-muted-foreground/60"}`}>{pm.label}</p>
                      <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-light mt-1">{pm.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest px-1">Card Number</Label>
                    <Input value={form.cardNumber} onChange={(e) => update("cardNumber", e.target.value)} className="bg-white/[0.03] border-white/5 py-6 rounded-xl font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest px-1">Expiry</Label>
                      <Input value={form.cardExpiry} onChange={(e) => update("cardExpiry", e.target.value)} className="bg-white/[0.03] border-white/5 py-6 rounded-xl font-mono" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest px-1">CVV</Label>
                      <Input value={form.cardCvv} onChange={(e) => update("cardCvv", e.target.value)} type="password" className="bg-white/[0.03] border-white/5 py-6 rounded-xl font-mono" />
                    </div>
                  </div>
                </motion.div>
              )}
              
              {paymentMethod === "upi" && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                   <Label className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest px-1">UPI ID</Label>
                   <Input value={form.upiId} onChange={(e) => update("upiId", e.target.value)} className="bg-white/[0.03] border-white/5 py-6 rounded-xl" placeholder="yourname@upi" />
                </motion.div>
              )}
              
              {paymentMethod === "netbanking" && <p className="text-muted-foreground text-xs font-light tracking-widest uppercase py-4 text-center">You will be redirected to your bank's secure page.</p>}
              {paymentMethod === "cod" && <p className="text-muted-foreground text-xs font-light tracking-widest uppercase py-4 text-center">Pay with cash upon delivery. ₹49 flat COD charge applies.</p>}
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
            <div className=" rounded-3xl p-8 sticky top-28 bg-white/[0.02]">
              <h2 className="font-serif text-3xl text-foreground mb-10">Summary</h2>

              <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/5 bg-white/[0.02] shrink-0">
                        <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <p className="text-foreground text-[10px] font-black uppercase tracking-widest truncate">{item.product.title}</p>
                      <p className="text-muted-foreground/40 text-[10px] mt-1 uppercase tracking-widest">Qty: {item.quantity}</p>
                      <p className="text-primary font-serif text-sm mt-1">₹{(item.product.priceNum * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="border-t border-white/5 pt-8 mb-8">
                <p className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                    <Tag className="w-3 h-3 text-primary" /> Apply Coupon
                </p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                    <span className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> {appliedCoupon}
                    </span>
                    <button onClick={handleRemoveCoupon} className="text-muted-foreground text-[10px] uppercase font-black transition-colors hover:text-destructive">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                        placeholder="SACRED20" 
                        className="bg-white/[0.03] border-white/5 text-[10px] font-black uppercase tracking-widest h-12 flex-1 rounded-xl" 
                    />
                    <Button 
                        onClick={handleApplyCoupon} 
                        variant="outline" 
                        className="border-primary/20 text-primary hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest px-4 h-12 rounded-xl"
                    >Apply</Button>
                  </div>
                )}
                <p className="text-muted-foreground/20 text-[9px] mt-2 uppercase tracking-widest text-center">Try: CRYSTAL10, SACRED20, FLAT200</p>
              </div>

              <div className="border-t border-white/5 pt-8 space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-black"><span className="text-muted-foreground/60">Subtotal</span><span className="text-foreground">₹{totalPrice.toLocaleString("en-IN")}</span></div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-black"><span className="text-primary">Discount</span><span className="text-primary">-₹{couponDiscount.toLocaleString("en-IN")}</span></div>
                )}
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-black"><span className="text-muted-foreground/60">Shipping</span><span className={shipping === 0 ? "text-primary" : "text-foreground"}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
                {codCharge > 0 && <div className="flex justify-between text-[10px] uppercase tracking-widest font-black"><span className="text-muted-foreground/60">Serv. Fee</span><span className="text-foreground">₹49</span></div>}
                
                <div className="border-t border-white/5 pt-6 flex justify-between items-end">
                  <span className="text-foreground text-xs uppercase font-black tracking-widest">Total</span>
                  <span className="text-gold-gradient font-serif text-4xl font-bold leading-none">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button 
                onClick={handlePlaceOrder} 
                disabled={processing} 
                className="w-full mt-10 bg-gold-gradient text-white font-sans tracking-[0.25em] font-black uppercase text-[10px] py-8 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20"
              >
                {processing ? (
                  <span className="flex items-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Blessing...
                  </span>
                ) : (
                  <span className="flex items-center gap-3"><Lock className="w-4 h-4" />Place Order</span>
                )}
              </Button>
              
              <div className="flex items-center justify-center gap-2 mt-6">
                <Lock className="w-3 h-3 text-muted-foreground/20" />
                <span className="text-muted-foreground/30 text-[9px] uppercase tracking-widest font-black">Secure Checkout · SSL Encrypted</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
