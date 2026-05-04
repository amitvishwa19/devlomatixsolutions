"use client"
import { CartProvider } from "../_contexts/CartContext";
import { WishlistProvider } from "../_contexts/WishlistContext";
import { CompareProvider } from "../_contexts/CompareContext";
import { CurrencyProvider } from "../_contexts/CurrencyContext";
import { ThemeProvider } from "../_contexts/ThemeContext";
import { ReviewsProvider } from "../_contexts/ReviewsContext";

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <ReviewsProvider>
                {children}
              </ReviewsProvider>
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}