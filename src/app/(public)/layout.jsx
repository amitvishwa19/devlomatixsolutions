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
  const storeConfigUrl = process.env.STORE_CONFIG_URL

  return (
    <EcommProvider appIdentifier={appIdentifier} storeConfigUrl={storeConfigUrl}>
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
