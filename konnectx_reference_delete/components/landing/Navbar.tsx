import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";

const navLinks = [
  { label: "Home", to: "/", isRoute: true, exact: true },
  { label: "Features", href: "/#features", isRoute: false },
  { label: "Pricing", to: "/pricing", isRoute: true },
  { label: "Blog", to: "/blog", isRoute: true },
  { label: "About", to: "/about", isRoute: true },
  { label: "Contact", to: "/contact", isRoute: true },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--gradient-sun)" }}>
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-[var(--font-heading)]">
            Konnect<span className="text-gradient-sun">X</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) =>
            l.isRoute ? (
              <Link
                key={l.label}
                to={l.to!}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-sm font-medium text-primary border-b-2 border-primary pb-0.5" }}
                activeOptions={{ exact: "exact" in l && l.exact ? true : false }}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.href!}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            )
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
            <Link to="/contact">{t("nav.login")}</Link>
          </Button>
          <Button size="sm" className="font-semibold" style={{ background: "var(--gradient-sun)" }} asChild>
            <Link to="/pricing">{t("nav.trial")}</Link>
          </Button>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="glass border-t border-border px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            {navLinks.map((l) =>
              l.isRoute ? (
                <Link
                  key={l.label}
                  to={l.to!}
                  className="text-sm font-medium text-muted-foreground"
                  activeProps={{ className: "text-sm font-medium text-primary" }}
                  activeOptions={{ exact: "exact" in l && l.exact ? true : false }}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href!}
                  className="text-sm font-medium text-muted-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              )
            )}
            <div className="mt-2 flex flex-col gap-2">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <Button variant="outline" size="sm" asChild><Link to="/contact" onClick={() => setMobileOpen(false)}>Login</Link></Button>
              <Button size="sm" style={{ background: "var(--gradient-sun)" }} asChild><Link to="/pricing" onClick={() => setMobileOpen(false)}>Start Free Trial</Link></Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
