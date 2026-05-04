"use client"
import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

const WHATSAPP_NUMBER = "919999999999";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <Link
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20CrystalAura`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </Link>
  );
}