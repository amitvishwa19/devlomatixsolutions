
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";
import carewellLogo from "@/assets/images/logo/logo.png";
import Link from "next/link";

const footerLinks = {
    product: { title: "Product", links: [{ name: "Home", href: "/" }, { name: "Features", href: "/feature" }, { name: "About", href: "/about" }, { name: "Contact", href: "/contact" }] },
    legal: { title: "Legal", links: [{ name: "Privacy Policy", href: "/privacy" }, { name: "Terms of Service", href: "/terms" }] }
};

const Footer = () => {
    return (
        <footer className="bg-foreground text-background">
            <div className="container mx-auto px-4 md:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center mb-6">
                            <img src={carewellLogo.src} alt="CareWell" className="h-10 brightness-0 invert" />
                        </Link>
                        <p className="text-background/70 mb-6 max-w-xs">Comprehensive hospital management system designed to streamline healthcare operations.</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-background/70"><Mail className="w-4 h-4" /><span>contact@carewell.devlomatix.in</span></div>
                            <div className="flex items-center gap-3 text-sm text-background/70"><Phone className="w-4 h-4" /><span>(+91) 9825632772</span></div>
                            <div className="flex items-center gap-3 text-sm text-background/70"><MapPin className="w-4 h-4" /><span>Vadodara, Gujarat</span></div>
                        </div>
                    </div>
                    {Object.entries(footerLinks).map(([key, section]) => (
                        <div key={key}>
                            <h4 className="font-display font-semibold text-background mb-4">{section.title}</h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (<li key={link.name}>
                                    <Link href={link.href} className="text-sm text-primary hover:text-background">{link.name}</Link>
                                </li>))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-background/60">© 2026 devlomatix.in. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (<a key={i} href="#" className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20"><Icon className="w-5 h-5 text-background/70" /></a>))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
