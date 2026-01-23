import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const payments = [
  {
    id: "PAY-001",
    patient: "Rajesh Kumar",
    department: "Cardiology",
    amount: 15000,
    method: "stripe",
    date: "Today",
    time: "10:30 AM",
  },
  {
    id: "PAY-002",
    patient: "Amit Patel",
    department: "Pathology",
    amount: 8500,
    method: "upi",
    date: "Today",
    time: "2:15 PM",
  },
  {
    id: "PAY-003",
    patient: "Neha Singh",
    department: "Neurology",
    amount: 22000,
    method: "razorpay",
    date: "Yesterday",
    time: "11:45 AM",
  },
  {
    id: "PAY-004",
    patient: "Vikram Rao",
    department: "Orthopedics",
    amount: 5500,
    method: "upi",
    date: "Yesterday",
    time: "4:30 PM",
  },
  {
    id: "PAY-005",
    patient: "Meera Joshi",
    department: "ENT",
    amount: 3200,
    method: "stripe",
    date: "Jan 18",
    time: "9:00 AM",
  },
];

const methodIcons = {
  stripe: CreditCard,
  razorpay: Building2,
  upi: Smartphone,
};

const methodColors = {
  stripe: "bg-info/10 text-info",
  razorpay: "bg-primary/10 text-primary",
  upi: "bg-success/10 text-success",
};

const methodNames = {
  stripe: "Card",
  razorpay: "Razorpay",
  upi: "UPI",
};

const RecentPayments = () => {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden animate-slide-up">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold font-heading">Recent Payments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Latest transactions
          </p>
        </div>
        <Badge variant="secondary" className="font-medium">
          {payments.length} today
        </Badge>
      </div>
      <div className="divide-y divide-border">
        {payments.map((payment) => {
          const Icon = methodIcons[payment.method];
          return (
            <div 
              key={payment.id}
              className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors"
            >
              <div className={cn("rounded-xl p-2.5", methodColors[payment.method])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{payment.patient}</p>
                <p className="text-xs text-muted-foreground">
                  {payment.department} • {methodNames[payment.method]}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-success">+₹{payment.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{payment.date}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 bg-muted/20 border-t border-border">
        <Button variant="ghost" className="w-full justify-between text-primary hover:text-primary">
          View all transactions
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RecentPayments;
