import { Lock, Truck, RotateCcw, ShieldCheck, BadgeCheck } from "lucide-react";

const seals = [
  { icon: Lock, title: "256-bit SSL Checkout", desc: "Your data is encrypted end-to-end" },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Cards, UPI, NetBanking & Wallets" },
  { icon: RotateCcw, title: "7-Day Easy Returns", desc: "No-questions-asked refund policy" },
  { icon: Truck, title: "Insured Shipping", desc: "Tracked & protected in transit" },
  { icon: BadgeCheck, title: "100% Authentic", desc: "Lab-certified natural crystals" },
];

const TrustSeals = () => (
  <div className="glass-card rounded-xl p-5 mb-6">
    <p className="text-[11px] tracking-widest text-gold mb-3 text-center">✦ SHOP WITH CONFIDENCE ✦</p>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {seals.map((s) => (
        <div key={s.title} className="flex flex-col items-center text-center gap-1.5">
          <s.icon className="w-6 h-6 text-gold" />
          <p className="text-xs font-medium leading-tight">{s.title}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{s.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default TrustSeals;