"use client"
import Link from "next/link";
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const OrderConfirmationPage = () => {
  const orderId = `CA-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 mt-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="font-serif text-3xl md:text-4xl mb-2">Thank You!</h1>
          <p className="text-muted-foreground">Your order <span className="text-gold font-medium">{orderId}</span> has been placed successfully.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6 mb-8">
          <h2 className="font-serif text-xl mb-4">Order Summary</h2>
          <p className="text-muted-foreground text-sm">You will receive a confirmation email with your order details shortly.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
          <div className="flex items-center gap-3 glass-card rounded-xl p-4">
            <Mail className="w-5 h-5 text-gold" />
            <p className="text-sm">Confirmation email sent to your email address</p>
          </div>
          <div className="flex items-center gap-3 glass-card rounded-xl p-4">
            <Package className="w-5 h-5 text-gold" />
            <p className="text-sm">Estimated delivery: 3-5 business days</p>
          </div>
        </motion.div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link href="/shop" className="gold-gradient text-primary-foreground px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/account" className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors text-center">
            View Order Status
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;