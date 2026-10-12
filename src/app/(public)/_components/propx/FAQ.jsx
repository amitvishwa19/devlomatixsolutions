'use client';

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does PropX connect with KonnectX for WhatsApp rent alerts?",
    a: "PropX is natively wired into Devlomatix's KonnectX WhatsApp Cloud integration. You can configure automated cron alerts to trigger 3 days before rent is due, on the due date, and after grace periods. Messages include a secure one-click checkout link and receipt download."
  },
  {
    q: "Can I manage both commercial offices and residential apartments?",
    a: "Yes. PropX supports mixed-use developments. You can configure commercial leases with CAM (Common Area Maintenance) reconciliations, square footage escalation clauses, and residential leases with flat monthly rent and pet fees."
  },
  {
    q: "How does maintenance ticketing work for tenants and contractors?",
    a: "Tenants access a white-labeled web portal to submit maintenance issues with photo and video attachments. PropX automatically assigns approved plumbers or electricians, sends work order approvals to property managers, and tracks completion before releasing payment."
  },
  {
    q: "Are the digital lease agreements legally binding?",
    a: "Yes. PropX leases utilize cryptographic audit-trailed e-Signatures compliant with the ESIGN Act and UETA regulations. Every signed contract includes timestamp logs, IP address verification, and automated PDF cloud archival."
  },
  {
    q: "How long does it take to migrate existing rent rolls into PropX?",
    a: "Our automated data onboarding tool imports your existing tenant ledgers, unit numbers, lease expiration dates, and rent amounts from Excel, CSV, or legacy software in under 15 minutes."
  }
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="px-faq" className="py-20 bg-secondary/10 border-t border-border/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="module-badge mb-3">Frequently Asked Questions</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Real Estate & PropTech Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-border/60 bg-card overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-foreground cursor-pointer hover:bg-muted/30"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-amber-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
