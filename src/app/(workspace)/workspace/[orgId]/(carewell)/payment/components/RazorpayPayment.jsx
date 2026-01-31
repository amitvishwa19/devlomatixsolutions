import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  CreditCard, 
  Smartphone, 
  Building2,
  Wallet,
  Loader2,
  Shield,
} from 'lucide-react';
import { formatCurrency } from '../utils';
import { HOSPITAL_DETAILS } from '../types';

export function RazorpayPayment({ amount, invoice, onSuccess, onCancel }) {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate Razorpay payment flow
    // In production, this would integrate with actual Razorpay SDK
    setTimeout(() => {
      const paymentData = {
        amount,
        method: paymentMethod,
        gatewayTransactionId: `pay_${Date.now().toString(36).toUpperCase()}`,
        gatewayOrderId: `order_${Date.now().toString(36).toUpperCase()}`,
        receivedBy: 'Front Desk',
      };

      if (paymentMethod === 'upi') {
        paymentData.upiApp = 'razorpay';
        paymentData.metadata = { upiId };
      } else if (paymentMethod === 'card') {
        paymentData.cardLast4 = cardDetails.number.slice(-4);
        paymentData.cardBrand = cardDetails.number.startsWith('4') ? 'visa' : 'mastercard';
      }

      onSuccess(paymentData);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Razorpay Header */}
      <div className="flex items-center gap-3 p-4 bg-[#528FF0]/10 rounded-lg">
        <div className="w-10 h-10 bg-[#528FF0] rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">R</span>
        </div>
        <div>
          <h4 className="font-semibold">Razorpay Payment Gateway</h4>
          <p className="text-sm text-muted-foreground">Secure payment processing</p>
        </div>
        <div className="ml-auto">
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

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label>Select Payment Method</Label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="grid grid-cols-2 gap-3">
            <Label
              htmlFor="upi"
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'upi' ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <RadioGroupItem value="upi" id="upi" />
              <Smartphone className="w-4 h-4" />
              <span>UPI</span>
            </Label>
            <Label
              htmlFor="card"
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'card' ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <RadioGroupItem value="card" id="card" />
              <CreditCard className="w-4 h-4" />
              <span>Card</span>
            </Label>
            <Label
              htmlFor="netbanking"
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'netbanking' ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <RadioGroupItem value="netbanking" id="netbanking" />
              <Building2 className="w-4 h-4" />
              <span>Net Banking</span>
            </Label>
            <Label
              htmlFor="wallet"
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <RadioGroupItem value="wallet" id="wallet" />
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* UPI Details */}
      {paymentMethod === 'upi' && (
        <div className="space-y-3">
          <Label htmlFor="upi-id">Enter UPI ID</Label>
          <Input
            id="upi-id"
            placeholder="yourname@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            A payment request will be sent to your UPI app
          </p>
        </div>
      )}

      {/* Card Details */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardDetails.number}
              onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
              maxLength={19}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="•••"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                maxLength={4}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="name">Cardholder Name</Label>
            <Input
              id="name"
              placeholder="Name on card"
              value={cardDetails.name}
              onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Net Banking */}
      {paymentMethod === 'netbanking' && (
        <div className="grid grid-cols-3 gap-2">
          {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Other'].map((bank) => (
            <Button key={bank} variant="outline" size="sm" className="text-xs">
              {bank}
            </Button>
          ))}
        </div>
      )}

      {/* Wallet */}
      {paymentMethod === 'wallet' && (
        <div className="grid grid-cols-3 gap-2">
          {['Paytm', 'PhonePe', 'Amazon Pay', 'Freecharge', 'Mobikwik', 'Other'].map((wallet) => (
            <Button key={wallet} variant="outline" size="sm" className="text-xs">
              {wallet}
            </Button>
          ))}
        </div>
      )}

      {/* Pay Button */}
      <Button 
        className="w-full bg-[#528FF0] hover:bg-[#3d7de0]" 
        size="lg"
        onClick={handlePayment}
        disabled={isProcessing || (paymentMethod === 'upi' && !upiId)}
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
        Secured by Razorpay • PCI DSS Compliant
      </p>
    </div>
  );
}
