"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Heart,
  User,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Box,
  Bell,
  Mail,
  Shield,
  Download,
  Cog,
  Eye,
  EyeOff,
} from "lucide-react";
import { useWishlist } from "../_contexts/WishlistContext";
import { products } from "../_data/products";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { saveEcommerceConfig } from "../account/_actions";
import SettingsSection from "./_components/SettingsSection";

const menu = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "profile", label: "Profile", icon: User },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
];

const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
};

const AccountPage = () => {
  const [active, setActive] = useState("orders");
  const { wishlistIds } = useWishlist();
  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));
  const { data: session } = useSession();

  console.log("session from account page", session);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">


          <aside className="glass-card rounded-lg p-6 h-fit">
            <div className="flex flex-col items-center text-center pb-6 border-b border-border">
              <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center mb-3">
                <User className="w-9 h-9 text-gold" />
              </div>
              <h3 className="font-serif text-lg">{mockUser.name}</h3>
              <p className="text-xs text-muted-foreground">{mockUser.email}</p>
            </div>

            <nav className="mt-4 space-y-1">
              {menu.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => setActive(item.id)}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </Button>
                );
              })}
            </nav>

            <Button variant="ghost" className="mt-6 pt-4 border-t border-border w-full justify-start text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </aside>

          <motion.section
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl p-8 min-h-[500px]"
          >
            {active === "orders" && (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-serif text-2xl">Order History</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track and manage your orders
                    </p>
                  </div>
                  <span className="text-xs text-gold border border-gold/30 bg-gold/10 px-3 py-1 rounded-full">
                    0 Orders
                  </span>
                </div>
                <div className="border border-dashed border-border rounded-xl py-16 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Box className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-lg">No orders yet</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Start your crystal journey with us
                  </p>
                  <Link
                      href="/shop"
                      className="gold-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Browse Shop
                    </Link>
                </div>
              </>
            )}

            {active === "wishlist" && (
              <>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl">My Wishlist</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {wishlistedProducts.length} saved items
                  </p>
                </div>
                {wishlistedProducts.length === 0 ? (
                  <div className="border border-dashed border-border rounded-xl py-16 flex flex-col items-center text-center">
                    <Heart className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="font-serif text-lg">No favorites yet</p>
                    <p className="text-sm text-muted-foreground">
                      Tap the heart on any product to save it
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistedProducts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        className="glass-card rounded-xl overflow-hidden hover:border-primary/30 transition-all"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-3">
                          <p className="text-sm font-medium truncate">
                            {p.name}
                          </p>
                          <p className="text-gold text-sm mt-1">
                            ₹{p.price.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {active === "profile" && (
              <>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl">Profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your personal information
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                  {[
                    { label: "FULL NAME", value: mockUser.name },
                    { label: "EMAIL", value: mockUser.email },
                    { label: "PHONE", value: "+91 98765 43210" },
                    { label: "DATE OF BIRTH", value: "—" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-xs text-muted-foreground tracking-wider mb-1 block">
                        {f.label}
                      </label>
                      <input
                        defaultValue={f.value}
                        className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
                <Button className="mt-6">
                  Save Changes
                </Button>
              </>
            )}

            {active === "addresses" && (
              <>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl">Saved Addresses</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your shipping addresses
                  </p>
                </div>
                <div className="border border-dashed border-border rounded-xl py-16 flex flex-col items-center text-center">
                  <MapPin className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="font-serif text-lg">No addresses saved</p>
                  <p className="text-sm text-muted-foreground mb-5">
                    Add an address for faster checkout
                  </p>
                  <Button>
                      + Add New Address
                    </Button>
                </div>
              </>
            )}

            {active === "settings" && <SettingsSection />}
          </motion.section>
        </div>
      </div>
    </div>
  );
};



export default AccountPage;
