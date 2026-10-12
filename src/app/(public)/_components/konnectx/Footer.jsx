'use client';

import React from "react";
import Image from "next/image";
import konnectXLogo from "@/assets/images/konnectx/konnectX.png";

const footerLinks = {
  Product: [
    { label: "Features", id: "kx-features" },
    { label: "Pricing", id: "kx-pricing" },
    { label: "Industries", id: "kx-industries" },
    { label: "Integrations", id: "kx-integrations" },
  ],
  Platform: [
    { label: "Verified Green Tick", id: "kx-features" },
    { label: "Chatbot Builder", id: "kx-features" },
    { label: "Shared Team Inbox", id: "kx-features" },
    { label: "REST APIs & Webhooks", id: "kx-integrations" },
  ],
  Resources: [
    { label: "Customer Reviews", id: "kx-testimonials" },
    { label: "Frequently Asked Questions", id: "kx-faq" },
    { label: "Pricing Calculator", id: "kx-pricing" },
    { label: "Start Free Trial", id: "kx-cta" },
  ],
};

export function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="border-t border-border/50 bg-secondary/10">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div 
              onClick={() => scrollTo("kx-hero")}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={konnectXLogo}
                  alt="KonnectX Logo"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-lg font-extrabold text-foreground">
                Konnect<span className="text-gradient-sun">X</span>
              </span>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              The unified WhatsApp Business API marketing & support suite built for disruptive ventures.
            </p>
            <p className="mt-3 text-[11px] text-primary font-semibold">
              Part of the Devlomatix Ecosystem
            </p>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">{heading}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary cursor-pointer text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="section-divider mt-10" />
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
          <div>
            © {new Date().getFullYear()} KonnectX by Devlomatix Solutions. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-foreground/70">Official WhatsApp Solution Provider</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
