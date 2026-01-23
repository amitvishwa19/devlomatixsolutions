import { useState } from "react";
import {
  IndianRupee,
  Receipt,
  TrendingUp,
  Users,
  Plus,
  Bell,
  Clock,
  Download,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import StatCard from "@/billing/components/StatCard";
import BillsTable from "@/billing/components/BillsTable";
import PaymentModal from "@/billing/components/PaymentModal";
import CreateBillForm from "@/billing/components/CreateBillForm";
import RecentPayments from "@/billing/components/RecentPayments";
import ThemeToggle from "@/billing/components/ThemeToggle";
import QuickStats from "@/billing/components/QuickStats";
import { toast } from "sonner";

const Index = () => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  const handlePayClick = (bill) => {
    setSelectedBill(bill);
    setPaymentModalOpen(true);
  };

  const handleExport = () => {
    toast.success("Exporting data...", {
      description: "Your billing report is being generated",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-lg">MediBill</h1>
                <p className="text-xs text-muted-foreground">Hospital Billing & Payments</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <Button variant="outline" onClick={handleExport} className="hidden sm:flex gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setCreateSheetOpen(true)} className="rounded-xl gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Bill</span>
              </Button>
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  AD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-heading">Overview</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Collection"
              value="₹1,24,500"
              icon={IndianRupee}
              variant="primary"
              trend="up"
              trendValue={12}
            />
            <StatCard
              title="Pending Bills"
              value="18"
              icon={Receipt}
              trend="down"
              trendValue={5}
            />
            <StatCard
              title="Patients Today"
              value="47"
              icon={Users}
              variant="success"
              trend="up"
              trendValue={8}
            />
            <StatCard
              title="Collection Rate"
              value="94.2%"
              icon={TrendingUp}
              variant="warning"
              trend="up"
              trendValue={3}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <BillsTable onPayClick={handlePayClick} />
            </div>
            <div>
              <RecentPayments />
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        bill={selectedBill}
      />

      {/* Create Bill Sheet */}
      <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto bg-card border-border">
          <SheetHeader>
            <SheetTitle className="font-heading text-xl">Create New Bill</SheetTitle>
            <SheetDescription>
              Generate a new bill for a patient
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CreateBillForm onClose={() => setCreateSheetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
