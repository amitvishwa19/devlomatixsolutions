import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Smartphone, Loader2, QrCode, CheckCircle2 } from 'lucide-react';
import { formatCurrency, validateUPIId } from '../utils';
import { UPI_APPS, HOSPITAL_DETAILS } from '../types';

export function UPIPayment({ amount, invoice, onSuccess, onCancel }) {
  const [upiId, setUpiId] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onSuccess({
        amount,
        method: 'upi',
        upiApp: selectedApp || 'direct',
        upiTransactionId: `UPI-${Date.now().toString(36).toUpperCase()}`,
        metadata: { upiId },
        receivedBy: 'Front Desk',
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-[#00BFA5]/10 rounded-lg">
        <div className="w-10 h-10 bg-[#00BFA5] rounded-lg flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold">UPI Payment</h4>
          <p className="text-sm text-muted-foreground">Pay via any UPI app</p>
        </div>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Amount</span>
          <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
        </div>
      </Card>

      <div className="space-y-3">
        <Label>Select UPI App</Label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(UPI_APPS).map((app) => (
            <Button
              key={app.id}
              variant={selectedApp === app.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedApp(app.id)}
              className="flex-col h-auto py-3"
            >
              <span className="text-xl mb-1">{app.icon}</span>
              <span className="text-xs">{app.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Customer UPI ID</Label>
        <Input
          placeholder="name@upi"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
        />
      </div>

      <Button className="w-full bg-[#00BFA5] hover:bg-[#00a08a]" size="lg" onClick={handlePayment} disabled={isProcessing || !upiId}>
        {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : `Collect ${formatCurrency(amount)}`}
      </Button>
    </div>
  );
}
