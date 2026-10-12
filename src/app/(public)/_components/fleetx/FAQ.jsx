'use client';

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Does FleetX require specialized vehicle hardware installation?",
    a: "FleetX is hardware-agnostic. You can connect standard plug-and-play OBD-II dongles in under 2 minutes, wire in heavy-duty J1939 CAN-bus telemetry for diesel freight rigs, or use the FleetX Driver Mobile App for instant smartphone-based GPS without hardware."
  },
  {
    q: "How does the KonnectX WhatsApp delivery portal work?",
    a: "When a dispatch order is generated, FleetX uses Devlomatix's KonnectX WhatsApp Cloud API to automatically send the customer a verified WhatsApp template. Customers tap a secure link to view the vehicle's real-time position, driver contact, and accurate ETA without needing to install any app."
  },
  {
    q: "How accurate is the CAN-Bus fuel siphon detector?",
    a: "Our firmware reads the vehicle's electronic float and fuel injector flow rate directly. If fuel drops faster than the engine's maximum burn rate while the ignition is off, an instant emergency alarm is triggered with GPS coordinates and dispatched to your control room."
  },
  {
    q: "What happens when vehicles enter remote areas without cellular coverage?",
    a: "Every certified FleetX telematics unit contains onboard non-volatile flash memory that stores up to 100,000 high-frequency GPS, CAN-bus, and acceleration records. As soon as cellular connectivity returns, the queue batch-syncs instantly without data loss."
  },
  {
    q: "Can FleetX synchronize with SAP, Oracle, or custom ERP systems?",
    a: "Yes. FleetX provides real-time Webhooks, RESTful APIs, and gRPC endpoints for two-way synchronization of manifests, delivery confirmations, e-Way bills, and driver trip allowances."
  }
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="fx-faq" className="py-20 bg-secondary/10 border-t border-border/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="module-badge mb-3">Frequently Asked Questions</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Everything You Need to Know About FleetX
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
                    className={`h-4 w-4 text-sky-500 shrink-0 transition-transform duration-200 ${
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
