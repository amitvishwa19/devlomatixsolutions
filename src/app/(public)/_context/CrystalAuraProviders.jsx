'use client';

import React, { createContext, useContext, useState, useEffect } from "react";

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
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("crystal-aura-cart");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("crystal-aura-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
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

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.priceNum * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen }}
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
    setItems((prev) => prev.some((p) => p.id === product.id) ? prev : [...prev, product]);
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

// --- IMAGE PACK CONTEXT ---
const ImagePackContext = createContext(undefined);
export const ImagePackProvider = ({ children }) => {
  const [imagePack, setImagePack] = useState("pack-7"); // default to pack-7

  useEffect(() => {
    const stored = localStorage.getItem("crystal-aura-image-pack");
    if (stored) setImagePack(stored);
  }, []);

  const changeImagePack = (pack) => {
    localStorage.setItem("crystal-aura-image-pack", pack);
    setImagePack(pack);
  };

  // Helper to resolve product image from the selected pack
  const getProductImage = (productId, originalImage) => {
    const match = String(productId).match(/^p([1-9])$/);
    if (match) {
      const num = match[1];
      return `/crystalaura/products/${imagePack}/product_${num}.png`;
    }
    return originalImage;
  };

  return (
    <ImagePackContext.Provider value={{ imagePack, changeImagePack, getProductImage }}>
      {children}
    </ImagePackContext.Provider>
  );
};
export const useImagePack = () => {
  const context = useContext(ImagePackContext);
  if (!context) throw new Error("useImagePack must be used within ImagePackProvider");
  return context;
};

// --- CONSOLIDATED PROVIDER ---
export const CrystalAuraProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <ImagePackProvider>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              {children}
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </ImagePackProvider>
    </ThemeProvider>
  );
};
