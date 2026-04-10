import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", to: "/pricing" },
    { label: "Integrations", href: "/#integrations" },
    { label: "API Docs", to: "/api-docs" },
    { label: "Changelog", to: "/changelog" },
  ],
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Careers", to: "/careers" },
    { label: "Blog", to: "/blog" },
    { label: "Press", to: "/press" },
    { label: "Contact", to: "/contact" },
  ],
  Resources: [
    { label: "Help Center", to: "/help-center" },
    { label: "Community", to: "/community" },
    { label: "Templates", to: "/templates" },
    { label: "Case Studies", to: "/case-studies" },
    { label: "Webinars", to: "/webinars" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Cookie Policy", to: "/cookie-policy" },
    { label: "GDPR", to: "/gdpr" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
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
                {links.map((link) => {
                  const routeTo = "to" in link ? link.to : undefined;
                  return (
                    <li key={link.label}>
                      {routeTo ? (
                        <Link to={routeTo} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                          {link.label}
                        </Link>
                      ) : (
                        <a href={"href" in link ? link.href : "#"} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                          {link.label}
                        </a>
                      )}
                    </li>
                  );
                })}
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
