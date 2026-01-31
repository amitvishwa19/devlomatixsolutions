import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  CreditCard, 
  Loader2,
  Shield,
  Lock,
} from 'lucide-react';
import { formatCurrency } from '../utils';

export function StripePayment({ amount, invoice, onSuccess, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    country: 'IN',
    zip: '',
  });

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate Stripe payment flow
    // In production, this would integrate with actual Stripe SDK
    setTimeout(() => {
      const paymentData = {
        amount,
        method: 'card',
        gatewayTransactionId: `pi_${Date.now().toString(36).toUpperCase()}`,
        cardLast4: cardDetails.number.slice(-4) || '4242',
        cardBrand: cardDetails.number.startsWith('4') ? 'visa' : 
                   cardDetails.number.startsWith('5') ? 'mastercard' : 'visa',
        receivedBy: 'Front Desk',
      };

      onSuccess(paymentData);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Stripe Header */}
      <div className="flex items-center gap-3 p-4 bg-[#635BFF]/10 rounded-lg">
        <div className="w-10 h-10 bg-[#635BFF] rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold">Stripe Payment Gateway</h4>
          <p className="text-sm text-muted-foreground">International card payments</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Lock className="w-4 h-4 text-emerald-500" />
          <Shield className="w-5 h-5 text-emerald-500" />
        </div>
      </div>

      {/* Amount Display */}
      <Card className="p-4 bg-muted/50">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Amount to Pay</span>
          <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
        </div>
      </Card>

      {/* Card Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="card-number">Card Number</Label>
          <div className="relative">
            <Input
              id="card-number"
              placeholder="1234 1234 1234 1234"
              value={cardDetails.number}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                setCardDetails({ ...cardDetails, number: value });
              }}
              maxLength={19}
              className="pl-10"
            />
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Expiration</Label>
            <Input
              id="expiry"
              placeholder="MM / YY"
              value={cardDetails.expiry}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + ' / ' + value.slice(2);
                }
                setCardDetails({ ...cardDetails, expiry: value });
              }}
              maxLength={7}
            />
          </div>
          <div>
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              placeholder="CVC"
              type="password"
              value={cardDetails.cvc}
              onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
              maxLength={4}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="cardholder">Cardholder Name</Label>
          <Input
            id="cardholder"
            placeholder="Full name on card"
            value={cardDetails.name}
            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value="India"
              disabled
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="zip">PIN Code</Label>
            <Input
              id="zip"
              placeholder="400001"
              value={cardDetails.zip}
              onChange={(e) => setCardDetails({ ...cardDetails, zip: e.target.value })}
              maxLength={6}
            />
          </div>
        </div>
      </div>

      {/* Accepted Cards */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="text-xs text-muted-foreground">Accepted:</div>
        <div className="flex gap-2">
          {['Visa', 'Mastercard', 'Amex', 'RuPay'].map((card) => (
            <span key={card} className="text-xs px-2 py-1 bg-muted rounded">
              {card}
            </span>
          ))}
        </div>
      </div>

      {/* Pay Button */}
      <Button 
        className="w-full bg-[#635BFF] hover:bg-[#4b45d1]" 
        size="lg"
        onClick={handlePayment}
        disabled={isProcessing || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvc}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${formatCurrency(amount)}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Powered by Stripe • Bank-level security
      </p>
    </div>
  );
}
