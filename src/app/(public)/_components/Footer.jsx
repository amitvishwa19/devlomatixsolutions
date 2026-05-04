import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-gold text-xl">✧</span>
              <span className="font-serif text-xl font-bold">
                Crystal <span className="text-gold">Aura</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Discover authentic gemstones, crystal bracelets, healing spheres,
              and spiritual pyramids — handpicked to align your energy.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-gold transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-gold transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-gold transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-gold transition-colors"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link></li>
              <li><Link href="/crystals" className="hover:text-foreground transition-colors">Crystals</Link></li>
              <li><Link href="/vastu" className="hover:text-foreground transition-colors">Vastu</Link></li>
              <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/crystal-care" className="hover:text-foreground transition-colors">Crystal Care</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-4 text-gold">Customer Service</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Return Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-4 text-gold">Stay Connected</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for crystal tips, exclusive offers, and spiritual insights.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Crystal Aura. All rights reserved. Crafted with ✧ and sacred intention.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
