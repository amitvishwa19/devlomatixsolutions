'use client';

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Users, DollarSign, Eye, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyRevenue = [
  { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 53000 },
  { month: "Mar", revenue: 48000 }, { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 }, { month: "Jun", revenue: 72000 },
  { month: "Jul", revenue: 68000 }, { month: "Aug", revenue: 85000 },
  { month: "Sep", revenue: 79000 }, { month: "Oct", revenue: 92000 },
  { month: "Nov", revenue: 105000 }, { month: "Dec", revenue: 118000 },
];

const dailyVisitors = [
  { day: "Mon", visitors: 320 }, { day: "Tue", visitors: 450 },
  { day: "Wed", visitors: 380 }, { day: "Thu", visitors: 520 },
  { day: "Fri", visitors: 610 }, { day: "Sat", visitors: 780 },
  { day: "Sun", visitors: 690 },
];

const categoryData = [
  { name: "Crystals", value: 40 }, { name: "Jewelry", value: 25 },
  { name: "Meditation", value: 20 }, { name: "Vastu", value: 15 },
];

const COLORS = ["hsl(40,65%,55%)", "hsl(280,40%,55%)", "hsl(340,40%,65%)", "hsl(200,50%,50%)"];

const stats = [
  { title: "Total Revenue", value: "₹8,78,000", change: "+12.5%", up: true, icon: DollarSign },
  { title: "Total Orders", value: "1,247", change: "+8.2%", up: true, icon: ShoppingBag },
  { title: "Total Visitors", value: "34,590", change: "+15.3%", up: true, icon: Users },
  { title: "Conversion", value: "3.6%", change: "-0.4%", up: false, icon: TrendingUp },
];

const recentOrders = [
  { id: "CA-2K8F", customer: "Priya S.", amount: 2499, product: "Amethyst Geode", status: "delivered" },
  { id: "CA-3J9G", customer: "Rahul M.", amount: 699, product: "Mala Beads", status: "shipped" },
  { id: "CA-4K1H", customer: "Ananya K.", amount: 1299, product: "Healing Sphere", status: "confirmed" },
  { id: "CA-5L2I", customer: "Vikram P.", amount: 899, product: "Pyramid", status: "delivered" },
  { id: "CA-6M3J", customer: "Meera R.", amount: 499, product: "Crystal Bracelet", status: "shipped" },
];

const statusColors = {
  confirmed: "text-primary",
  shipped: "text-blue-400",
  delivered: "text-green-400",
};

export default function CrystalAuraAnalyticsPage() {
  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">✦ Business Insights ✦</p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6 font-semibold">
            <span className="text-gold-gradient">Analytics</span> Dashboard
          </h1>
          <p className="text-muted-foreground font-light text-sm uppercase tracking-widest">Demo data — connect spiritual cloud for real analytics.</p>
          <div className="section-divider w-48 mx-auto mt-8" />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="glass-card border-white/5 bg-white/[0.02] rounded-3xl p-8 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform"><stat.icon className="w-5 h-5 text-primary" /></div>
                  <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${stat.up ? "text-green-400" : "text-red-400"}`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-foreground font-serif text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-muted-foreground/40 text-[10px] uppercase tracking-widest font-black">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <div className="glass-card border-white/5 bg-white/[0.02] rounded-[2.5rem] p-8 md:p-10">
              <h2 className="font-serif text-2xl text-foreground mb-8 font-bold">Monthly Revenue</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, backdropFilter: 'blur(10px)', color: "#fff" }}
                      itemStyle={{ fontSize: 12, fontWeight: 700, color: 'hsl(40,65%,55%)' }}
                      formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(40,65%,55%)" radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
             <div className="glass-card border-white/5 bg-white/[0.02] rounded-[2.5rem] p-8 md:p-10">
              <h2 className="font-serif text-2xl text-foreground mb-8 font-bold">Visitor Flow</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyVisitors}>
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, backdropFilter: 'blur(10px)', color: "#fff" }} />
                    <Line type="monotone" dataKey="visitors" stroke="hsl(280,40%,55%)" strokeWidth={3} dot={{ fill: "hsl(280,40%,55%)", r: 5, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Breakdown */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <div className="glass-card border-white/5 bg-white/[0.02] rounded-[2.5rem] p-8 md:p-10 h-full">
              <h2 className="font-serif text-2xl text-foreground mb-8 font-bold">Category Reach</h2>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 space-y-2">
                 {categoryData.map((cat, i) => (
                    <div key={cat.name} className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                          <span className="text-muted-foreground/60">{cat.name}</span>
                       </div>
                       <span className="text-foreground">{cat.value}%</span>
                    </div>
                 ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
            <div className="glass-card border-white/5 bg-white/[0.02] rounded-[2.5rem] p-8 md:p-10">
              <h2 className="font-serif text-2xl text-foreground mb-10 font-bold">Sacred Activity</h2>
              <div className="space-y-6">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary font-serif text-lg font-bold group-hover:scale-110 transition-transform">
                        {order.customer[0]}
                      </div>
                      <div>
                        <p className="text-foreground text-xs font-black uppercase tracking-widest">{order.customer}</p>
                        <p className="text-muted-foreground/40 text-[10px] uppercase tracking-widest mt-1">{order.product}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-serif text-xl font-bold">₹{order.amount.toLocaleString("en-IN")}</p>
                      <p className={`text-[9px] uppercase font-black tracking-[0.2em] mt-1 ${statusColors[order.status]}`}>{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
