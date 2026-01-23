import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const BillReceipt = ({ open, onOpenChange, bill, paymentMethod }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Simulate download
    const receiptData = `
MEDIBILL HOSPITAL
Payment Receipt
================
Receipt No: RCP-${Date.now().toString().slice(-6)}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Patient: ${bill?.patient}
Patient ID: ${bill?.patientId}
Department: ${bill?.department}
Bill ID: ${bill?.id}

Amount Paid: ₹${bill?.amount?.toLocaleString()}
Payment Method: ${paymentMethod || 'Card'}

Thank you for your payment!
    `;
    
    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${bill?.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Payment Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Hospital Header */}
          <div className="text-center space-y-1">
            <h3 className="font-heading font-bold text-lg">MediBill Hospital</h3>
            <p className="text-xs text-muted-foreground">123 Healthcare Avenue, Medical District</p>
            <p className="text-xs text-muted-foreground">Tel: +91 1234567890</p>
          </div>

          <Separator />

          {/* Receipt Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receipt No</span>
              <span className="font-medium">RCP-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date & Time</span>
              <span className="font-medium">{new Date().toLocaleString()}</span>
            </div>
          </div>

          <Separator />

          {/* Patient & Bill Info */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Patient Name</span>
              <span className="font-medium">{bill?.patient}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Patient ID</span>
              <span className="font-medium">{bill?.patientId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Department</span>
              <span className="font-medium">{bill?.department}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bill ID</span>
              <span className="font-medium">{bill?.id}</span>
            </div>
          </div>

          <Separator />

          {/* Payment Info */}
          <div className="bg-success/10 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium capitalize">{paymentMethod || 'Card'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Amount Paid</span>
              <span className="text-2xl font-bold text-success">₹{bill?.amount?.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Thank you for your payment. This is a computer-generated receipt.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button className="flex-1 gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillReceipt;
