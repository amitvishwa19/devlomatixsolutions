import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, User, Calendar, CreditCard, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function BillingCard({
    invoiceId,
    patientName,
    date,
    items,
    totalAmount,
    status,
    paymentMethod,
    insuranceCoverage,
    dueDate,
}) {

    const statusColors = {
        Paid: "bg-green-500/10 text-green-500 border-green-500/20",
        Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        Overdue: "bg-red-500/10 text-red-500 border-red-500/20",
        Partial: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };

    const patientAmount = insuranceCoverage
        ? totalAmount - insuranceCoverage
        : totalAmount;


    return (
        <Card className='dark:bg-[#151D24] shadow-sm border rounded-lg'>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Invoice #{invoiceId}</CardTitle>
                            <p className="text-sm text-muted-foreground">{patientName}</p>
                        </div>
                    </div>
                    <Badge className={cn("border", statusColors[status])}>{status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Date: {date}</span>
                </div>
                {dueDate && status !== "Paid" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {dueDate}</span>
                    </div>
                )}
                {paymentMethod && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>{paymentMethod}</span>
                    </div>
                )}
                <div className="border-t pt-3 space-y-2">
                    <p className="text-sm font-medium">Items:</p>
                    {items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.description}</span>
                            <span className="font-medium">${item.amount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Total Amount:</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    {insuranceCoverage && (
                        <>
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Insurance Coverage:</span>
                                <span>-${insuranceCoverage.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-semibold">
                                <span>Patient Responsibility:</span>
                                <span>${patientAmount.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                        {status === "Paid" ? "View Receipt" : "Process Payment"}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
