"use client"
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Heart, User, MapPin, Settings, LogOut, ChevronRight, Box, Bell, Mail, Shield, Download, Cog, Eye, EyeOff } from "lucide-react";
import { useWishlist } from "../_contexts/WishlistContext";
import { products } from "../_data/products";

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

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="glass-card rounded-2xl p-6 h-fit">
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
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-gold/10 text-gold border border-gold/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </button>
                );
              })}
            </nav>

            <button className="mt-6 pt-4 border-t border-border w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
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
                    <p className="text-sm text-muted-foreground mt-1">Track and manage your orders</p>
                  </div>
                  <span className="text-xs text-gold border border-gold/30 bg-gold/10 px-3 py-1 rounded-full">0 Orders</span>
                </div>
                <div className="border border-dashed border-border rounded-xl py-16 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Box className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-lg">No orders yet</h3>
                  <p className="text-sm text-muted-foreground mb-5">Start your crystal journey with us</p>
                  <Link href="/shop" className="gold-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    Browse Shop
                  </Link>
                </div>
              </>
            )}

            {active === "wishlist" && (
              <>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl">My Wishlist</h2>
                  <p className="text-sm text-muted-foreground mt-1">{wishlistedProducts.length} saved items</p>
                </div>
                {wishlistedProducts.length === 0 ? (
                  <div className="border border-dashed border-border rounded-xl py-16 flex flex-col items-center text-center">
                    <Heart className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="font-serif text-lg">No favorites yet</p>
                    <p className="text-sm text-muted-foreground">Tap the heart on any product to save it</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistedProducts.map((p) => (
                      <Link key={p.id} href={`/product/${p.id}`} className="glass-card rounded-xl overflow-hidden hover:border-primary/30 transition-all">
                        <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />
                        <div className="p-3">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-gold text-sm mt-1">₹{p.price.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground mt-1">Manage your personal information</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                  {[
                    { label: "FULL NAME", value: mockUser.name },
                    { label: "EMAIL", value: mockUser.email },
                    { label: "PHONE", value: "+91 98765 43210" },
                    { label: "DATE OF BIRTH", value: "—" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-xs text-muted-foreground tracking-wider mb-1 block">{f.label}</label>
                      <input defaultValue={f.value} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  ))}
                </div>
                <button className="mt-6 gold-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </>
            )}

            {active === "addresses" && (
              <>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl">Saved Addresses</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage your shipping addresses</p>
                </div>
                <div className="border border-dashed border-border rounded-xl py-16 flex flex-col items-center text-center">
                  <MapPin className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="font-serif text-lg">No addresses saved</p>
                  <p className="text-sm text-muted-foreground mb-5">Add an address for faster checkout</p>
                  <button className="gold-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    + Add New Address
                  </button>
                </div>
              </>
            )}

            {active === "settings" && <SettingsPanel />}
          </motion.section>
        </div>
      </div>
    </div>
  );
};

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-gold" : "bg-secondary border border-border"}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
  </button>
);

const Row = ({ title, desc, right, danger }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <div>
      <p className={`text-sm font-medium ${danger ? "text-destructive" : ""}`}>{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </div>
    {right}
  </div>
);

const SettingsCard = ({ icon: Icon, title, children }) => (
  <div className="border border-border rounded-xl p-5 bg-secondary/30">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-gold" />
      <h3 className="font-serif text-base">{title}</h3>
    </div>
    <div className="divide-y divide-border">{children}</div>
  </div>
);

const SettingsPanel = () => {
  const [prefs, setPrefs] = useState({
    email: true, sms: false, orders: true, promo: false, newsletter: true,
  });
  const [api, setApi] = useState({ storeId: "my-store", url: "https://api.example.com", key: "" });
  const [showKey, setShowKey] = useState(false);

  return (
    <>
      <div className="mb-6">
        <h2 className="font-serif text-2xl">Account Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Customize your preferences</p>
      </div>

      <div className="space-y-5 max-w-3xl">
        <SettingsCard icon={Bell} title="Notification Preferences">
          <Row title="Email Notifications" desc="Receive updates via email"
            right={<Toggle checked={prefs.email} onChange={(v) => setPrefs({ ...prefs, email: v })} />} />
          <Row title="SMS Notifications" desc="Receive updates via SMS"
            right={<Toggle checked={prefs.sms} onChange={(v) => setPrefs({ ...prefs, sms: v })} />} />
          <Row title="Order Updates" desc="Track your order status"
            right={<Toggle checked={prefs.orders} onChange={(v) => setPrefs({ ...prefs, orders: v })} />} />
        </SettingsCard>

        <SettingsCard icon={Mail} title="Marketing Preferences">
          <Row title="Promotional Emails" desc="Receive offers and discounts"
            right={<Toggle checked={prefs.promo} onChange={(v) => setPrefs({ ...prefs, promo: v })} />} />
          <Row title="Newsletter" desc="Weekly spiritual insights"
            right={<Toggle checked={prefs.newsletter} onChange={(v) => setPrefs({ ...prefs, newsletter: v })} />} />
        </SettingsCard>

        <SettingsCard icon={Shield} title="Privacy & Security">
          <button className="w-full text-left">
            <Row title="Change Password" desc="Update your password"
              right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
          </button>
          <button className="w-full text-left">
            <Row title="Two-Factor Authentication" desc="Add extra security"
              right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
          </button>
        </SettingsCard>

        <SettingsCard icon={Download} title="Data Management">
          <button className="w-full text-left">
            <Row title="Download My Data" desc="Export your account data"
              right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
          </button>
          <button className="w-full text-left">
            <Row danger title="Delete Account" desc="Permanently delete your account"
              right={<ChevronRight className="w-4 h-4 text-destructive" />} />
          </button>
        </SettingsCard>

        <SettingsCard icon={Cog} title="API Configuration">
          <div className="py-3 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground tracking-wider mb-1 block">STORE ID</label>
              <input value={api.storeId} onChange={(e) => setApi({ ...api, storeId: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground tracking-wider mb-1 block">BACKEND URL</label>
              <input value={api.url} onChange={(e) => setApi({ ...api, url: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground tracking-wider mb-1 block">API KEY</label>
              <div className="relative">
                <input type={showKey ? "text" : "password"} value={api.key} onChange={(e) => setApi({ ...api, key: e.target.value })}
                  placeholder="Enter your API key"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <button type="button" onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button className="gold-gradient text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Save Settings</button>
              <button className="border border-gold text-gold px-5 py-2 rounded-lg text-sm font-medium hover:bg-gold/10 transition-colors">Test Connection</button>
            </div>
          </div>
        </SettingsCard>
      </div>
    </>
  );
};

export default AccountPage;