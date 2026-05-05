import { MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Addresses = () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="font-serif text-2xl">Saved Addresses</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your shipping addresses
        </p>
      </div>
      <div className="border border-dashed border-border rounded-xl py-16 flex flex-col items-center text-center">
        <MapPin className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="font-serif text-lg">No addresses saved</p>
        <p className="text-sm text-muted-foreground mb-5">
          Add an address for faster checkout
        </p>
        <Button>
          + Add New Address
        </Button>
      </div>
    </>
  );
};

export default Addresses;