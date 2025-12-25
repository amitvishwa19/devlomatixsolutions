import { Hospital, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gradient-dark text-primary-foreground/80">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Hospital className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-display font-bold text-xl text-primary-foreground">
                                HMSPro
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-primary-foreground/70">
                            Transforming healthcare operations with intelligent, centralized management solutions.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-display font-semibold text-primary-foreground mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            {["Features", "Modules", "Benefits", "Pricing"].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-display font-semibold text-primary-foreground mb-4">Resources</h4>
                        <ul className="space-y-3">
                            {["Documentation", "API Reference", "Support", "Blog"].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-display font-semibold text-primary-foreground mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                                <Mail className="w-4 h-4" />
                                <span>support@hmspro.com</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                                <Phone className="w-4 h-4" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                                <MapPin className="w-4 h-4 mt-0.5" />
                                <span>123 Healthcare Ave, Medical City, MC 12345</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
                    <p className="text-sm text-primary-foreground/50">
                        © {new Date().getFullYear()} HMSPro. All rights reserved. | Operational Intelligence for Healthcare
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
