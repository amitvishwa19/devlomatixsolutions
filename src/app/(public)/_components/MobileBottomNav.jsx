"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "../_contexts/CartContext";
import { useWishlist } from "../_contexts/WishlistContext";

const items = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/shop", icon: Search, label: "Shop" },
  { href: "/wishlist", icon: Heart, label: "Wishlist", badge: "wishlist" },
  { href: "cart", icon: ShoppingBag, label: "Cart", badge: "cart" },
  { href: "/account", icon: User, label: "Account" },
];

const MobileBottomNav = () => {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();

  const renderItem = (it) => {
    const Icon = it.icon;
    const isActive = pathname === it.href;
    const count = it.badge === "cart" ? totalItems : it.badge === "wishlist" ? wishlistIds.length : 0;
    const inner = (
      <span className={`flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${isActive ? "text-gold" : "text-muted-foreground"}`}>
        <span className="relative">
          <Icon className="w-5 h-5" />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-gold text-primary-foreground text-[9px] min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center font-medium">
              {count}
            </span>
          )}
        </span>
        <span className="text-[10px] tracking-wide">{it.label}</span>
      </span>
    );
    if (it.href === "cart") {
      return (
        <button key={it.label} onClick={() => setIsCartOpen(true)} className="flex-1">
          {inner}
        </button>
      );
    }
    return (
      <Link key={it.href} href={it.href} className="flex-1">
        {inner}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Primary mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">{items.map(renderItem)}</div>
    </nav>
  );
};

export default MobileBottomNav;