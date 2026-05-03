'use client';

import React from "react";
import { motion } from "framer-motion";
import { useOrders } from "../_context/CrystalAuraProviders";
import { Package, ShoppingBag, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  confirmed: "bg-primary/10 text-primary border-primary/20 shadow-sm",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function CrystalAuraOrdersPage() {
  const { orders } = useOrders();

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">
            ✦ Your Purchases ✦
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6">
            <span className="text-gold-gradient font-semibold">Order</span> History
          </h1>
          <div className="section-divider w-48 mx-auto mt-8" />
        </motion.div>

        {orders.length === 0 ? (
          <div className="text-center py-32 glass-card rounded-3xl bg-white/[0.02]">
            <div className="w-20 h-20 bg-white/[0.03] rounded-full mx-auto flex items-center justify-center mb-8 border border-white/5">
                <Package className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-light text-lg mb-2">No orders found yet</p>
            <p className="text-muted-foreground/40 text-[10px] uppercase font-bold tracking-widest mb-10">Start your collection today</p>
            <Link href="/shop">
              <Button className="bg-gold-gradient text-white px-10 py-7 rounded-2xl font-sans tracking-[0.2em] font-black uppercase text-[10px] hover:opacity-90 shadow-xl shadow-primary/20 transition-all">
                <Search className="w-4 h-4 mr-2" />
                Browse Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card border-white/5 bg-white/[0.02] rounded-[2rem] p-8 md:p-10 hover:border-white/10 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-serif text-2xl font-bold uppercase tracking-tight">#{order.id}</p>
                      <p className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest mt-1">{order.date}</p>
                    </div>
                  </div>
                  <Badge className={`${statusColors[order.status] || "bg-white/5 text-white"} border uppercase tracking-[0.2em] px-4 py-1.5 rounded-full text-[9px] font-black shadow-lg`}>
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-6 mb-10 bg-white/[0.01] rounded-2xl p-6 border border-white/5">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-6 group">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/5 bg-white/[0.02] shrink-0">
                        <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <p className="text-foreground text-[10px] uppercase font-black tracking-widest truncate">{item.product.title}</p>
                        <p className="text-muted-foreground/40 text-[9px] mt-1 uppercase tracking-widest">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-primary font-serif text-lg">₹{(item.product.priceNum * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-wrap items-end justify-between gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground/40 text-[10px] uppercase tracking-widest font-black">Method: <span className="text-muted-foreground/60">{order.paymentMethod}</span></p>
                    {order.couponCode && (
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <p className="text-primary text-[10px] uppercase tracking-widest font-black">Coupon: {order.couponCode}</p>
                        </div>
                    )}
                  </div>
                  <div className="text-right">
                     <p className="text-muted-foreground/40 text-[10px] uppercase font-black tracking-widest mb-1">Total Blessed Value</p>
                     <p className="text-gold-gradient font-serif text-3xl font-bold">₹{order.total.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
