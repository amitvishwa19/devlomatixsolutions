import { Providers } from "./_components/Providers";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import CartDrawer from "./_components/CartDrawer";
import MobileBottomNav from "./_components/MobileBottomNav";
import CompareBar from "./_components/CompareBar";
import WhatsAppButton from "./_components/WhatsAppButton";
import NewsletterPopup from "./_components/NewsletterPopup";
import "./_styles/crystals.css";
import { EcommProvider } from "./_contexts/EcommProvider";
import axios from "@/utils/axios";
import { db } from "@/lib/db";

export default async function CrystalAuraLayout({ children }) {
  const appIdentifier = process.env.ENCRYPTION_KEY;

  let appConfig = {
    "_id": "661919d08e2ea37643a46b62",
    "storeName": "Crystal Aura",
    "logo": "",
    "favicon": "",
    "currency": "₹",
    "defaultLanguage": "English",
    "timezone": "Asia/Kolkata",
    "contactEmail": ["[EMAIL_ADDRESS]"],
    "contactPhone": [
      {
        "code": "+91",
        "number": "9876543210",
        "whatsapp": true,
        "primary": true
      }
    ],
    "shippingRegions": [
      {
        "code": "india",
        "name": "India",
        "countries": [
          {
            "code": "IN",
            "name": "India"
          }
        ],
        "states": [],
        "cities": [],
        "shippingMethods": [
          {
            "name": "Standard Shipping",
            "cost": 100,
            "deliveryTime": "3-5 business days"
          }
        ]
      }
    ],
    "shippingMethods": [
      {
        "_id": "661919d08e2ea37643a46b62",
        "code": "shipping-method-1",
        "name": "Standard Shipping",
        "icon": null,
        "countries": ["India"],
        "states": ["MH"],
        "cities": ["Mumbai"],
        "minimumOrderAmount": 1000,
        "freeShippingThreshold": 2500,
        "shippingFee": 100,
        "estimatedDelivery": "5-7 days"
      },
      {
        "_id": "661919d08e2ea37643a46b63",
        "code": "shipping-method-2",
        "name": "Express Shipping",
        "icon": null,
        "countries": ["India"],
        "states": ["MH", "KA"],
        "cities": ["Mumbai", "Delhi"],
        "minimumOrderAmount": 0,
        "freeShippingThreshold": 0,
        "shippingFee": 200,
        "estimatedDelivery": "2-3 days"
      }
    ],
    "paymentMethods": [
      {
        "name": "Cash On Delivery",
        "code": "cod",
        "testMode": false,
        "isLive": true,
        "allowedCountries": ["India"]
      },
      {
        "name": "Razorpay",
        "code": "razorpay",
        "testMode": true,
        "isLive": true,
        "allowedCountries": ["India"]
      }
    ],
    "taxes": [],
    "returnAndRefundPolicy": "Standard 30-day return policy. Items must be unused and in original packaging.",
    "shippingPolicy": "All orders ship within 2 business days. Standard delivery takes 3-5 days.",
    "privacyPolicy": "We respect your privacy and protect your personal information.",
    "termsOfService": "By accessing this site, you agree to our terms of service.",
    "metaTitle": "Crystal Aura - Premium Crystals & Gemstones",
    "metaDescription": "Discover high-quality crystals, gemstones, and healing stones. Ethically sourced and beautifully crafted.",
    "metaKeywords": ["crystal", "gemstone", "healing stones", "amethyst", "quartz"],
    "customFields": {},
    "createdAt": "2026-04-11T10:58:56.027Z",
    "updatedAt": "2026-04-11T10:58:56.027Z"
  }

  return (
    <EcommProvider appConfig={appConfig}>
      <Providers>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <MobileBottomNav />
          <CompareBar />

          <NewsletterPopup />
        </div>
      </Providers>
    </EcommProvider>
  );
}
