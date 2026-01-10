import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Check, CreditCard, Download, Zap, Crown, Building2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import SectionHeader from "../_components/SectionHeader";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 9,
    description: "Perfect for individuals",
    icon: Zap,
    features: ["5 projects", "10GB storage", "Email support", "Basic analytics"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "Best for professionals",
    icon: Crown,
    features: ["Unlimited projects", "100GB storage", "Priority support", "Advanced analytics", "API access", "Custom integrations"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    description: "For large teams",
    icon: Building2,
    features: ["Everything in Pro", "Unlimited storage", "24/7 support", "Custom contracts", "SLA guarantee", "Dedicated manager"],
  },
];

const mockInvoices = [
  { id: "INV-001", date: "Jan 15, 2024", amount: "$29.00", status: "Paid" },
  { id: "INV-002", date: "Dec 15, 2023", amount: "$29.00", status: "Paid" },
  { id: "INV-003", date: "Nov 15, 2023", amount: "$29.00", status: "Paid" },
  { id: "INV-004", date: "Oct 15, 2023", amount: "$29.00", status: "Paid" },
];

const mockPaymentMethods = [
  { id: "1", type: "Visa", last4: "4242", expiry: "12/25", isDefault: true },
  { id: "2", type: "Mastercard", last4: "8888", expiry: "08/26", isDefault: false },
];

export function BillingSubscriptionSettings() {
  const currentPlan = "pro";

  const handleUpgrade = async (planId) => {
    const toastId = toast.loading(`Upgrading to ${planId} plan...`);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`Successfully upgraded to ${planId} plan`, { id: toastId });
    } catch (error) {
      toast.error("Failed to upgrade plan", { id: toastId });
    }
  };

  const downloadInvoice = async (invoiceId) => {
    const toastId = toast.loading(`Downloading invoice ${invoiceId}...`);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`Invoice ${invoiceId} downloaded successfully`, { id: toastId });
    } catch (error) {
      toast.error("Failed to download invoice", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Billing & Subscription"
        description="Manage your subscription, payment methods, and billing history"
      />

      <ScrollArea className="flex-1 h-[60vh] p-4">
        <div className="space-y-8">
          {/* Current Plan & Usage */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Current Plan
                </CardTitle>
                <CardDescription>Pro Plan - $29/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Next billing date</span>
                    <span className="font-medium">Feb 15, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Plan status</span>
                    <Badge>Active</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">Cancel Subscription</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage This Month</CardTitle>
                <CardDescription>Your current resource usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span>45GB / 100GB</span>
                  </div>
                  <Progress value={45} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Calls</span>
                    <span>8,500 / 50,000</span>
                  </div>
                  <Progress value={17} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Projects</span>
                    <span>12 / Unlimited</span>
                  </div>
                  <Progress value={100} className="bg-muted" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Plan Comparison */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Available Plans</h4>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${plan.popular ? "border-primary shadow-md" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <plan.icon className="h-5 w-5" />
                      <CardTitle>{plan.name}</CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={currentPlan === plan.id ? "secondary" : "default"}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={currentPlan === plan.id}
                    >
                      {currentPlan === plan.id ? "Current Plan" : "Upgrade"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Methods */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-lg">Payment Methods</h4>
              <Button variant="outline" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>
            <div className="space-y-3">
              {mockPaymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {method.type} ending in {method.last4}
                        {method.isDefault && (
                          <Badge variant="secondary" className="ml-2">Default</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">Expires {method.expiry}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button variant="ghost" size="sm">Set as Default</Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Billing History */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Billing History</h4>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{invoice.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadInvoice(invoice.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
