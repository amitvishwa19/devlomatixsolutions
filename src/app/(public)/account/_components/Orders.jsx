import Link from "next/link";
import { Box } from "lucide-react";

const Orders = () => {
  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl">Order History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your orders
          </p>
        </div>
        <span className="text-xs text-gold border border-gold/30 bg-gold/10 px-3 py-1 rounded-full">
          0 Orders
        </span>
      </div>
      <div className="border border-dashed border-border rounded-xl py-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Box className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-serif text-lg">No orders yet</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Start your crystal journey with us
        </p>
        <Link
          href="/shop"
          className="gold-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Browse Shop
        </Link>
      </div>
    </>
  );
};

export default Orders;