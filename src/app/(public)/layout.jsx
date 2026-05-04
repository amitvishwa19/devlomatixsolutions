import { Providers } from "./_components/Providers";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import CartDrawer from "./_components/CartDrawer";
import MobileBottomNav from "./_components/MobileBottomNav";
import CompareBar from "./_components/CompareBar";
import WhatsAppButton from "./_components/WhatsAppButton";
import NewsletterPopup from "./_components/NewsletterPopup";
import GoogleOneTapLogin from "./_components/GoogleOneTapLogin";
import "./_styles/crystals.css";

export default function CrystalAuraLayout({ children }) {
  return (
    <Providers>
      <GoogleOneTapLogin clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID} autoPrompt={false} />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
        <MobileBottomNav />
        <CompareBar />
        <WhatsAppButton />
        <NewsletterPopup />
      </div>
    </Providers>
  );
}