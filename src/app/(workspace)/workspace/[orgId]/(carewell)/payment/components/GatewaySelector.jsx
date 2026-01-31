import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Building2,
  Zap,
  Shield,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { PAYMENT_GATEWAYS, GATEWAY_CONFIG, GATEWAY_STATUS } from '../types';
import { formatCurrency } from '../utils';
import { mockGatewayStats } from '../mockData';

const gatewayIcons = {
  [PAYMENT_GATEWAYS.RAZORPAY]: () => (
    <div className="w-10 h-10 bg-[#528FF0]/10 rounded-lg flex items-center justify-center">
      <span className="text-xl">🔷</span>
    </div>
  ),
  [PAYMENT_GATEWAYS.STRIPE]: () => (
    <div className="w-10 h-10 bg-[#635BFF]/10 rounded-lg flex items-center justify-center">
      <CreditCard className="w-5 h-5 text-[#635BFF]" />
    </div>
  ),
  [PAYMENT_GATEWAYS.UPI]: () => (
    <div className="w-10 h-10 bg-[#00BFA5]/10 rounded-lg flex items-center justify-center">
      <Smartphone className="w-5 h-5 text-[#00BFA5]" />
    </div>
  ),
  [PAYMENT_GATEWAYS.CASH]: () => (
    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
      <Banknote className="w-5 h-5 text-emerald-500" />
    </div>
  ),
  [PAYMENT_GATEWAYS.NEFT]: () => (
    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
      <Building2 className="w-5 h-5 text-blue-500" />
    </div>
  ),
};

const gatewayDetails = {
  [PAYMENT_GATEWAYS.RAZORPAY]: {
    name: 'Razorpay',
    description: 'Cards, UPI, Netbanking, Wallets',
    features: ['Instant Settlement', 'Multi-method', 'Auto-capture'],
    successRate: mockGatewayStats.razorpay?.successRate || 98.2,
  },
  [PAYMENT_GATEWAYS.STRIPE]: {
    name: 'Stripe',
    description: 'International Cards, UPI',
    features: ['Global Cards', 'PCI Compliant', 'Recurring'],
    successRate: mockGatewayStats.stripe?.successRate || 99.1,
  },
  [PAYMENT_GATEWAYS.UPI]: {
    name: 'UPI Direct',
    description: 'GPay, PhonePe, Paytm, BHIM',
    features: ['Zero MDR', 'Instant', 'QR Code'],
    successRate: mockGatewayStats.upi?.successRate || 97.8,
  },
  [PAYMENT_GATEWAYS.CASH]: {
    name: 'Cash',
    description: 'Direct cash collection',
    features: ['Instant', 'No charges', 'Receipt'],
    successRate: 100,
  },
  [PAYMENT_GATEWAYS.NEFT]: {
    name: 'Bank Transfer',
    description: 'NEFT, RTGS, IMPS',
    features: ['Large amounts', 'Traceable', 'Secure'],
    successRate: 100,
  },
};

export function GatewaySelector({ amount, onSelect }) {
  const gateways = [
    PAYMENT_GATEWAYS.RAZORPAY,
    PAYMENT_GATEWAYS.STRIPE,
    PAYMENT_GATEWAYS.UPI,
    PAYMENT_GATEWAYS.CASH,
    PAYMENT_GATEWAYS.NEFT,
  ];

  return (
    <div className="space-y-3">
      {gateways.map((gateway) => {
        const IconComponent = gatewayIcons[gateway];
        const details = gatewayDetails[gateway];
        const stats = mockGatewayStats[gateway];
        const isOnline = gateway === PAYMENT_GATEWAYS.RAZORPAY || 
                        gateway === PAYMENT_GATEWAYS.STRIPE || 
                        gateway === PAYMENT_GATEWAYS.UPI;

        return (
          <Card
            key={gateway}
            className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary"
            onClick={() => onSelect(gateway)}
          >
            <div className="flex items-start gap-4">
              <IconComponent />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{details.name}</h4>
                  {stats?.status === GATEWAY_STATUS.ACTIVE && isOnline && (
                    <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{details.description}</p>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {details.features.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">{details.successRate}%</p>
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
