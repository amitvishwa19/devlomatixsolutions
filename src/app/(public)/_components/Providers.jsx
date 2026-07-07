"use client"
import { SessionProvider } from "next-auth/react"
import { useEffect, useRef } from "react"
import { CartProvider } from "../_contexts/CartContext"
import { WishlistProvider } from "../_contexts/WishlistContext"
import { CompareProvider } from "../_contexts/CompareContext"
import { CurrencyProvider } from "../_contexts/CurrencyContext"
import { ThemeProvider } from "../_contexts/ThemeContext"
import { ReviewsProvider } from "../_contexts/ReviewsContext"

export function Providers({ children }) {
  const filtered = useRef(false)
  
  useEffect(() => {
    if (filtered.current) return
    filtered.current = true
    
    const originalError = console.error
    console.error = function(...args) {
      if (
        args[0] && 
        typeof args[0] === 'object' && 
        args[0].message && 
        args[0].message.includes('CLIENT_FETCH_ERROR')
      ) {
        return
      }
      if (
        args[0] && 
        typeof args[0] === 'string' && 
        args[0].includes('CLIENT_FETCH_ERROR')
      ) {
        return
      }
      originalError.apply(console, args)
    }
  }, [])

  return (
    <SessionProvider>
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
    </SessionProvider>
  )
}