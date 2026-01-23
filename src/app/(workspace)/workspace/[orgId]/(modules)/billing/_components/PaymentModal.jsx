import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Smartphone, Building2, CheckCircle2, ShieldCheck, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import BillReceipt from "./BillReceipt";

const paymentMethods = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Credit/Debit Card",
    icon: CreditCard,
    color: "bg-info/10 text-info border-info/30",
  },
  {
    id: "razorpay",
    name: "Razorpay",
    description: "Cards, NetBanking, Wallets",
    icon: Building2,
    color: "bg-primary/10 text-primary border-primary/30",
  },
  {
    id: "upi",
    name: "UPI",
    description: "Google Pay, PhonePe, Paytm",
    icon: Smartphone,
    color: "bg-success/10 text-success border-success/30",
  },
];

const PaymentModal = ({ open, onOpenChange, bill }) => {
  const [selectedMethod, setSelectedMethod] = useState("stripe");
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    setSuccess(true);
    
    toast.success("Payment collected successfully!", {
      description: `₹${bill?.amount?.toLocaleString()} received from ${bill?.patient}`,
    });
  };

  const handleViewReceipt = () => {
    setSuccess(false);
    onOpenChange(false);
    setShowReceipt(true);
  };

  const handleClose = () => {
    setSuccess(false);
    onOpenChange(false);
  };

  const resetModal = () => {
    setSelectedMethod("stripe");
    setUpiId("");
    setProcessing(false);
    setSuccess(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => {
        if (!open) resetModal();
        onOpenChange(open);
      }}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 animate-scale-in">
              <div className="rounded-full bg-success/10 p-5 mb-5">
                <CheckCircle2 className="h-14 w-14 text-success" />
              </div>
              <h3 className="text-2xl font-bold font-heading">Payment Successful!</h3>
              <p className="text-muted-foreground mt-2 text-center">
                ₹{bill?.amount?.toLocaleString()} collected from {bill?.patient}
              </p>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button onClick={handleViewReceipt} className="gap-2">
                  <Receipt className="h-4 w-4" />
                  View Receipt
                </Button>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">Collect Payment</DialogTitle>
                <DialogDescription>
                  Process payment for {bill?.patient}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Bill Summary */}
                <div className="bg-muted/40 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Patient</span>
                    <span className="font-medium">{bill?.patient}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">{bill?.department}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bill ID</span>
                    <span className="font-medium">{bill?.id}</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{bill?.amount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Payment Method</Label>
                  <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="gap-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          selectedMethod === method.id 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/40 hover:bg-muted/30"
                        )}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                        <div className={cn("rounded-xl p-2.5 border", method.color)}>
                          <method.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                        <div className={cn(
                          "h-5 w-5 rounded-full border-2 transition-colors",
                          selectedMethod === method.id 
                            ? "border-primary bg-primary" 
                            : "border-muted-foreground/30"
                        )}>
                          {selectedMethod === method.id && (
                            <div className="h-full w-full flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* UPI ID Input */}
                {selectedMethod === "upi" && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="upi" className="font-semibold">UPI ID</Label>
                    <Input
                      id="upi"
                      placeholder="patient@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="h-11"
                    />
                  </div>
                )}

                {/* Card Details for Stripe */}
                {selectedMethod === "stripe" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="card" className="font-semibold">Card Number</Label>
                      <Input id="card" placeholder="4242 4242 4242 4242" className="h-11" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry" className="font-semibold">Expiry</Label>
                        <Input id="expiry" placeholder="MM/YY" className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="font-semibold">CVV</Label>
                        <Input id="cvv" placeholder="123" type="password" className="h-11" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Razorpay Options */}
                {selectedMethod === "razorpay" && (
                  <div className="space-y-3 animate-fade-in">
                    <Label className="font-semibold">Select Option</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Credit Card", "Debit Card", "NetBanking", "Wallet"].map((option) => (
                        <Button key={option} variant="outline" className="h-12 justify-start">
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Processing Payment...
                    </span>
                  ) : (
                    `Collect ₹${bill?.amount?.toLocaleString()}`
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secured with 256-bit SSL encryption</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <BillReceipt
        open={showReceipt}
        onOpenChange={setShowReceipt}
        bill={bill}
        paymentMethod={selectedMethod}
      />
    </>
  );
};

export default PaymentModal;
