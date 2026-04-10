'use client';
import Link from "next/link";
import { MessageCircle } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Integrations", href: "/#integrations" },
    { label: "API Docs", href: "/api-docs" },
    { label: "Changelog", href: "/changelog" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Help Center", href: "/help-center" },
    { label: "Community", href: "/community" },
    { label: "Templates", href: "/templates" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Webinars", href: "/webinars" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "GDPR", href: "/gdpr" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-sun)" }}>
                <MessageCircle className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground font-[var(--font-heading)]">
                Konnect<span className="text-gradient-sun">X</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              The complete WhatsApp Business API platform for modern businesses.
            </p>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-foreground">{heading}</h4>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="section-divider mt-10" />
        <div className="pt-6 text-center text-sm text-muted-foreground">
          © 2026 KonnectX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
