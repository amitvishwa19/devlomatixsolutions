'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Package, ShoppingBag, Heart, User, MapPin, Settings, LogOut, 
    ChevronRight, Clock, CreditCard, Bell, Shield, Edit2, Trash2,
    Box, Star, Download, Mail, Phone, Calendar
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useOrders, useWishlist, useCart } from "../_context/CrystalAuraProviders";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusColors = {
    confirmed: "bg-primary/10 text-primary border-primary/20 shadow-sm",
    shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    delivered: "bg-green-500/10 text-green-400 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const tabs = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "profile", label: "Profile", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
];

const mockAddresses = [
    {
        id: "1",
        name: "Home",
        fullName: "John Doe",
        address: "123, ABC Building, XYZ Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        phone: "+91 98765 43210",
        isDefault: true,
    },
    {
        id: "2",
        name: "Office",
        fullName: "John Doe",
        address: "456, Tech Park, Business District",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400002",
        phone: "+91 98765 43210",
        isDefault: false,
    },
];

const mockUserInfo = {
    displayName: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 98765 43210",
    avatar: null,
    joinedAt: "January 2024",
};

export default function AccountPage() {
    const { data: session } = useSession();
    const { orders } = useOrders();
    const { items: wishlistItems } = useWishlist();
    const { totalItems } = useCart();
    const [activeTab, setActiveTab] = useState("orders");
    const [addresses, setAddresses] = useState(mockAddresses);
    const user = session?.user || mockUserInfo;

    const handleSignOut = () => {
        signOut({ callbackUrl: "/" });
    };

    return (
        <div className="min-h-screen bg-transparent pt-12 pb-24 px-4 md:px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-12"
                >
                    <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">
                        ✦ Your Account ✦
                    </p>
                    <h1 className="font-serif text-4xl md:text-6xl text-foreground mb-4">
                        <span className="text-gold-gradient font-semibold">My</span> Dashboard
                    </h1>
                    <div className="section-divider w-32 mx-auto mt-6" />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1"
                    >
                        <div className="glass-card border-white/5 bg-white/[0.02] rounded-3xl p-6 sticky top-24">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 rounded-full bg-white/[0.05] border-2 border-primary/30 mx-auto mb-4 flex items-center justify-center">
                                    {user?.avatar || user?.image ? (
                                        <img 
                                            src={user.avatar || user.image} 
                                            alt={user.displayName || user.name} 
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-8 h-8 text-primary" />
                                    )}
                                </div>
                                <h3 className="text-foreground font-serif text-xl">{user?.displayName || user?.name || "Guest User"}</h3>
                                <p className="text-muted-foreground/50 text-xs mt-1">{user?.email}</p>
                            </div>

                            <div className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                                            activeTab === tab.id
                                                ? "bg-primary/10 border border-primary/20 text-primary"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <tab.icon className="w-4 h-4" />
                                            <span className="text-sm font-medium">{tab.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-50" />
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 mt-6 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">Sign Out</span>
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-3"
                    >
                        <AnimatePresence mode="wait">
                            {activeTab === "orders" && (
                                <motion.div
                                    key="orders"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="glass-card border-white/5 bg-white/[0.02] rounded-3xl p-6 md:p-8"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-foreground font-serif text-2xl">Order History</h2>
                                            <p className="text-muted-foreground/50 text-sm mt-1">Track and manage your orders</p>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs">
                                            {orders.length} Orders
                                        </Badge>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="text-center py-16 rounded-3xl bg-white/[0.01] border border-white/5">
                                            <div className="w-16 h-16 bg-white/[0.03] rounded-full mx-auto flex items-center justify-center mb-4 border border-white/5">
                                                <Package className="w-7 h-7 text-muted-foreground/30" />
                                            </div>
                                            <p className="text-muted-foreground font-light mb-1">No orders yet</p>
                                            <p className="text-muted-foreground/40 text-xs mb-6">Start your spiritual journey with us</p>
                                            <Link href="/crystalaura/shop">
                                                <Button className="bg-gold-gradient text-white px-6 py-2 rounded-xl text-xs font-medium">
                                                    Browse Shop
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order, idx) => (
                                                <motion.div
                                                    key={order.id}
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="border border-white/5 rounded-2xl p-4 md:p-6 hover:border-white/10 transition-all"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                                                                <ShoppingBag className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-foreground font-serif text-lg uppercase tracking-tight">#{order.id}</p>
                                                                <p className="text-muted-foreground/40 text-xs">{order.date}</p>
                                                            </div>
                                                        </div>
                                                        <Badge className={`${statusColors[order.status] || "bg-white/5 text-white"} border uppercase tracking-wider px-3 py-1 rounded-full text-[10px] font-medium`}>
                                                            {order.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-3 mb-4 bg-white/[0.01] rounded-xl p-4 border border-white/5">
                                                        {order.items.slice(0, 2).map((item, i) => (
                                                            <div key={i} className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/5 bg-white/[0.02] shrink-0">
                                                                    <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-foreground text-xs truncate">{item.product.title}</p>
                                                                    <p className="text-muted-foreground/40 text-[10px]">Qty: {item.quantity}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {order.items.length > 2 && (
                                                            <p className="text-muted-foreground/40 text-xs pl-13">+{order.items.length - 2} more items</p>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                                                        <p className="text-muted-foreground/50 text-xs">
                                                            Payment: {order.paymentMethod}
                                                        </p>
                                                        <div className="text-right">
                                                            <p className="text-muted-foreground/40 text-[10px]">Total</p>
                                                            <p className="text-gold-gradient font-serif text-xl">₹{order.total.toLocaleString("en-IN")}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "wishlist" && (
                                <motion.div
                                    key="wishlist"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="glass-card border-white/5 bg-white/[0.02] rounded-3xl p-6 md:p-8"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-foreground font-serif text-2xl">Wishlist</h2>
                                            <p className="text-muted-foreground/50 text-sm mt-1">Your saved sacred treasures</p>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs">
                                            {wishlistItems.length} Items
                                        </Badge>
                                    </div>

                                    {wishlistItems.length === 0 ? (
                                        <div className="text-center py-16 rounded-3xl bg-white/[0.01] border border-white/5">
                                            <div className="w-16 h-16 bg-white/[0.03] rounded-full mx-auto flex items-center justify-center mb-4 border border-white/5">
                                                <Heart className="w-7 h-7 text-muted-foreground/30" />
                                            </div>
                                            <p className="text-muted-foreground font-light mb-1">Your wishlist is empty</p>
                                            <p className="text-muted-foreground/40 text-xs mb-6">Save your favorites for later</p>
                                            <Link href="/crystalaura/shop">
                                                <Button className="bg-gold-gradient text-white px-6 py-2 rounded-xl text-xs font-medium">
                                                    Browse Shop
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {wishlistItems.map((item, idx) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    className="border border-white/5 rounded-2xl p-3 hover:border-white/10 transition-all"
                                                >
                                                    <div className="aspect-square rounded-xl overflow-hidden mb-3">
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <p className="text-foreground text-sm truncate">{item.title}</p>
                                                    <p className="text-primary font-serif mt-1">₹{item.priceNum?.toLocaleString("en-IN") || item.price?.toLocaleString("en-IN")}</p>
                                                    <Button className="w-full mt-3 bg-gold-gradient text-white py-2 rounded-xl text-xs">
                                                        Add to Cart
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "profile" && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="glass-card border-white/5 bg-white/[0.02] rounded-3xl p-6 md:p-8"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-foreground font-serif text-2xl">Profile Information</h2>
                                            <p className="text-muted-foreground/50 text-sm mt-1">Manage your account details</p>
                                        </div>
                                        <Button variant="outline" className="border-white/10 text-xs px-4 py-2">
                                            <Edit2 className="w-3 h-3 mr-2" />
                                            Edit
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <User className="w-4 h-4 text-primary" />
                                                    <p className="text-muted-foreground/50 text-xs uppercase tracking-wider">Full Name</p>
                                                </div>
                                                <p className="text-foreground">{user?.displayName || user?.name || "Not set"}</p>
                                            </div>

                                            <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Mail className="w-4 h-4 text-primary" />
                                                    <p className="text-muted-foreground/50 text-xs uppercase tracking-wider">Email</p>
                                                </div>
                                                <p className="text-foreground">{user?.email || "Not set"}</p>
                                            </div>

                                            <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Phone className="w-4 h-4 text-primary" />
                                                    <p className="text-muted-foreground/50 text-xs uppercase tracking-wider">Phone</p>
                                                </div>
                                                <p className="text-foreground">+91 98765 43210</p>
                                            </div>

                                            <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <p className="text-muted-foreground/50 text-xs uppercase tracking-wider">Member Since</p>
                                                </div>
                                                <p className="text-foreground">January 2024</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "addresses" && (
                                <motion.div
                                    key="addresses"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="glass-card border-white/5 bg-white/[0.02] rounded-3xl p-6 md:p-8"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-foreground font-serif text-2xl">Saved Addresses</h2>
                                            <p className="text-muted-foreground/50 text-sm mt-1">Manage your delivery addresses</p>
                                        </div>
                                        <Button className="bg-gold-gradient text-white px-4 py-2 rounded-xl text-xs">
                                            + Add New
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((address, idx) => (
                                            <motion.div
                                                key={address.id}
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all relative"
                                            >
                                                {address.isDefault && (
                                                    <Badge className="absolute top-3 right-3 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[10px]">
                                                        Default
                                                    </Badge>
                                                )}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    <p className="text-foreground font-medium">{address.name}</p>
                                                </div>
                                                <p className="text-foreground text-sm">{address.fullName}</p>
                                                <p className="text-muted-foreground/60 text-sm mt-1">{address.address}</p>
                                                <p className="text-muted-foreground/60 text-sm">{address.city}, {address.state} - {address.pincode}</p>
                                                <p className="text-muted-foreground/60 text-sm mt-2">{address.phone}</p>
                                                <div className="flex gap-2 mt-4">
                                                    <Button variant="outline" className="border-white/10 text-xs px-3 py-1 flex-1">
                                                        <Edit2 className="w-3 h-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button variant="outline" className="border-white/10 text-red-400 text-xs px-3 py-1">
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "settings" && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="glass-card border-white/5 bg-white/[0.02] rounded-3xl p-6 md:p-8"
                                >
                                    <div className="mb-8">
                                        <h2 className="text-foreground font-serif text-2xl">Account Settings</h2>
                                        <p className="text-muted-foreground/50 text-sm mt-1">Customize your preferences</p>
                                    </div>

                                    <div className="space-y-4">
                                        <button className="w-full flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Bell className="w-4 h-4 text-primary" />
                                                <div className="text-left">
                                                    <p className="text-foreground text-sm">Notifications</p>
                                                    <p className="text-muted-foreground/50 text-xs">Manage email & push notifications</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                                        </button>

                                        <button className="w-full flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-4 h-4 text-primary" />
                                                <div className="text-left">
                                                    <p className="text-foreground text-sm">Privacy & Security</p>
                                                    <p className="text-muted-foreground/50 text-xs">Password and 2FA settings</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                                        </button>

                                        <button className="w-full flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="w-4 h-4 text-primary" />
                                                <div className="text-left">
                                                    <p className="text-foreground text-sm">Payment Methods</p>
                                                    <p className="text-muted-foreground/50 text-xs">Manage saved cards</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                                        </button>

                                        <button className="w-full flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Download className="w-4 h-4 text-primary" />
                                                <div className="text-left">
                                                    <p className="text-foreground text-sm">Download Data</p>
                                                    <p className="text-muted-foreground/50 text-xs">Export your account data</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}