"use client"
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingCart, User, Menu, X, ChevronDown, LogOut, Settings } from "lucide-react";
import { useSession, signOut } from "next-auth/react"
import { useCart } from "../_contexts/CartContext";
import { useWishlist } from "../_contexts/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import CurrencySwitcher from "./CurrencySwitcher";

const navItems = [
  { type: "link", name: "Home", path: "/" },
  { type: "link", name: "Shop", path: "/shop" },
  {
    type: "group",
    name: "Discover",
    children: [
      { name: "Crystals", path: "/crystals", desc: "Browse our curated catalog" },
      { name: "Glossary A–Z", path: "/glossary", desc: "Encyclopedia of crystals" },
      { name: "Birthstones", path: "/birthstones", desc: "Find your birth crystal" },
      { name: "Moon Calendar", path: "/moon-calendar", desc: "Phases & rituals" },
      { name: "Vastu", path: "/vastu", desc: "Crystals for your space" },
      { name: "Crystal Care", path: "/crystal-care", desc: "Cleansing & charging" },
    ],
  },
  {
    type: "group",
    name: "Resources",
    children: [
      { name: "Blog", path: "/blog", desc: "Articles & guides" },
      { name: "FAQ", path: "/faq", desc: "Common questions" },
    ],
  },
  {
    type: "group",
    name: "About",
    children: [
      { name: "Our Story", path: "/about", desc: "About CrystalAura" },
      { name: "Contact", path: "/contact", desc: "Get in touch" },
    ],
  },
];

const isGroupActive = (group, pathname) =>
  group.children?.some((c) => c.path === pathname);

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null); // desktop hover/click
  const [openMobileGroup, setOpenMobileGroup] = useState(null);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);
  const { data: session } = useSession({ required: false })
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold text-foreground tracking-wide">
              Crystal<span className="text-gold">Aura</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.type === "link") {
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      active
                        ? "text-foreground border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              }

              const isOpen = openGroup === item.name;
              const active = isGroupActive(item, pathname);
              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setOpenGroup(item.name)}
                  onMouseLeave={() => setOpenGroup(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenGroup(isOpen ? null : item.name)}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      active || isOpen
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.name}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full pt-2 w-72"
                      >
                        <div className="rounded-lg border border-border bg-popover/95 backdrop-blur-md shadow-xl overflow-hidden">
                          {item.children.map((c) => {
                            const isActive = pathname === c.path;
                            return (
                              <Link
                                key={c.path}
                                href={c.path}
                                onClick={() => setOpenGroup(null)}
                                className={`block px-4 py-3 text-sm transition-colors ${
                                  isActive
                                    ? "bg-secondary text-gold"
                                    : "text-foreground hover:bg-secondary"
                                }`}
                              >
                                <div className="font-medium">{c.name}</div>
                                {c.desc && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {c.desc}
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <CurrencySwitcher />
            <ThemeToggle />
            <Link href="/wishlist" aria-label="Wishlist" className="text-muted-foreground hover:text-foreground transition-colors relative">
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors relative"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            {/* User Dropdown */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                aria-label="User menu"
              >
                {session?.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-full pt-2 w-56"
                  >
                    <div className="rounded-lg border border-border bg-popover/95 backdrop-blur-md shadow-xl overflow-hidden">
                      {session?.user ? (
                        <>
                          <div className="px-4 py-3 border-b border-border">
                            <p className="font-medium text-sm text-foreground">{session.user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                          </div>
                          <div className="py-1">
                            <Link
                              href="/account"
                              onClick={() => setUserOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              My Account
                            </Link>
                            <button
                              onClick={() => { setUserOpen(false); signOut({ callbackUrl: "/" }); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="py-1">
                          <Link
                            href="/login"
                            onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Login
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                if (item.type === "link") {
                  const active = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2 text-sm rounded-md ${
                        active
                          ? "text-gold bg-secondary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                }
                const isOpen = openMobileGroup === item.name;
                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      onClick={() => setOpenMobileGroup(isOpen ? null : item.name)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground"
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden pl-3 border-l border-border ml-3"
                        >
                          {item.children.map((c) => {
                            const isActive = pathname === c.path;
                            return (
                              <Link
                                key={c.path}
                                href={c.path}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-3 py-2 text-sm rounded-md ${
                                  isActive
                                    ? "text-gold bg-secondary"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {c.name}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
