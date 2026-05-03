'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { syncCart, clearCartOnOrder } from "@/lib/ecommerce";
import { useSession } from "next-auth/react";

// --- THEME CONTEXT ---
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const stored = localStorage.getItem("crystal-aura-theme");
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("crystal-aura-theme", theme);
    document.documentElement.classList.toggle("light", theme === "light");
    // Also toggle a specific class on a wrapper if needed
    const wrapper = document.querySelector('.crystal-aura-root');
    if (wrapper) wrapper.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

// --- CART CONTEXT ---
const CartContext = createContext(undefined);

const generateGuestId = () => 'guest_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

export const CartProvider = ({ children }) => {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [guestId, setGuestId] = useState(null);
  const [cartCreatedAt, setCartCreatedAt] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Sync cart to backend when items change
  useEffect(() => {
    const userId = session?.user?.userId;
    if (!userId && !guestId) return;
    if (items.length === 0) return;
    
    // Debounce sync
    const timeout = setTimeout(async () => {
      setSyncing(true);
      const totalAmount = items.reduce((sum, i) => sum + (i.product?.priceNum || i.product?.price || 0) * i.quantity, 0);
      const cartItems = items.map(i => ({
        productId: i.product.id,
        title: i.product.title,
        price: i.product.priceNum || i.product.price || 0,
        quantity: i.quantity,
        image: i.product.image,
      }));
      
      try {
        await syncCart(userId, {
          guestId,
          userId: userId || null,
          items: cartItems,
          totalAmount,
        });
      } catch (err) {
        // Silent fail - no backend configured
      } finally {
        setSyncing(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [items, guestId, session?.user?.userId]);

  useEffect(() => {
    const stored = localStorage.getItem("crystal-aura-cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const validItems = parsed.items?.filter((item) => item.product && item.product.id) || [];
        setItems(validItems);
        setGuestId(parsed.guestId || generateGuestId());
        setCartCreatedAt(parsed.createdAt || new Date().toISOString());
      } catch {
        setItems([]);
        setGuestId(generateGuestId());
        setCartCreatedAt(new Date().toISOString());
      }
    } else {
      setGuestId(generateGuestId());
      setCartCreatedAt(new Date().toISOString());
    }
  }, []);

  useEffect(() => {
    if (items.length > 0 || guestId) {
      localStorage.setItem("crystal-aura-cart", JSON.stringify({
        items,
        guestId,
        createdAt: cartCreatedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
  }, [items, guestId, cartCreatedAt]);

  const addItem = (product) => {
    if (!guestId) {
      const newGuestId = generateGuestId();
      setGuestId(newGuestId);
      setCartCreatedAt(new Date().toISOString());
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, addedAt: new Date().toISOString() }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = async (convertToOrder = false) => {
    const userId = session?.user?.userId;
    
    // If converting to order, clear from backend too
    if (convertToOrder && (userId || guestId)) {
      await clearCartOnOrder(userId, guestId, userId);
    }
    
    setItems([]);
    const newGuestId = generateGuestId();
    setGuestId(newGuestId);
    setCartCreatedAt(new Date().toISOString());
    localStorage.removeItem("crystal-aura-cart");
  };

  const getTotalItems = () => items.reduce((sum, i) => sum + i.quantity, 0);
  const getTotalPrice = () => items.reduce((sum, i) => sum + (i.product?.priceNum || 0) * i.quantity, 0);
  
  const isInCart = (productId) => items.some((i) => i.product.id === productId);
  const getItemQuantity = (productId) => items.find((i) => i.product.id === productId)?.quantity || 0;

  return (
    <CartContext.Provider
      value={{ 
        items, addItem, removeItem, updateQuantity, clearCart, 
        totalItems: getTotalItems(), 
        totalPrice: getTotalPrice(),
        guestId,
        cartCreatedAt, 
        isOpen, setIsOpen,
        isInCart,
        getItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

// --- WISHLIST CONTEXT ---
const WishlistContext = createContext(undefined);
export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("crystal-aura-wishlist");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("crystal-aura-wishlist", JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev;
      const updated = [product, ...prev];
      return updated.slice(0, 50);
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const isWishlisted = (productId) => items.some((p) => p.id === productId);

  const toggleWishlist = (product) => {
    if (isWishlisted(product.id)) removeItem(product.id);
    else addItem(product);
  };

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};

// --- RECENTLY VIEWED CONTEXT ---
const RecentlyViewedContext = createContext(undefined);
export const RecentlyViewedProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("crystal-aura-recently-viewed");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("crystal-aura-recently-viewed", JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered];
      return updated.slice(0, 20);
    });
  };

  const clear = () => setItems([]);

  return (
    <RecentlyViewedContext.Provider value={{ items, addItem, clear }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};
export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return context;
};

// --- ORDER CONTEXT ---
const OrderContext = createContext(undefined);
export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("crystal-aura-orders");
    if (stored) setOrders(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("crystal-aura-orders", JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order) => setOrders((prev) => [order, ...prev]);

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within OrderProvider");
  return context;
};

// --- CONSOLIDATED PROVIDER ---
export const CrystalAuraProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <OrderProvider>
              {children}
            </OrderProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
};
