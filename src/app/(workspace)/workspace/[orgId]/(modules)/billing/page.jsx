'use client'
import React from 'react'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from "react";
import { IndianRupee, Receipt, TrendingUp, Users, Plus, Bell, Clock, Download, Stethoscope, BarChart3, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, } from "@/components/ui/sheet";
import { toast } from "sonner";
import PaymentModal from './_components/PaymentModal';
import CreateBillForm from './_components/CreateBillForm';
import Link from 'next/link';

export default function BillingPage() {

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
        <div className='absolute inset-0 flex flex-col gap-2'>



            <ContentTopbar
                title='Billing'
                description='Smart, transparent hospital billing that ensures accuracy, speed, and trust.'
                icon='calendar-days'

            />

            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md'>
                <div className="min-h-screen bg-background">
                    <main>
                        {/* Header */}
                        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
                            <div className="flex items-center justify-between h-16 px-4 lg:px-8">

                                <div className="flex items-center gap-2 lg:gap-3">
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
                                <Link href="/analytics">
                                    <Button variant="outline" className="gap-2">
                                        <BarChart3 className="h-4 w-4" />
                                        View Analytics
                                    </Button>
                                </Link>
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
            </ScrollArea>


        </div >
    )
}
