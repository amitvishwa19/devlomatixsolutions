'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Download, Eye, IndianRupee } from "lucide-react";
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';


const payments = [
    { id: "PAY-001", invoice: "INV-001", patient: "Rajesh Kumar", amount: 1250, method: "Credit Card", date: "2024-01-15", status: "Completed" },
    { id: "PAY-002", invoice: "INV-004", patient: "Sneha Gupta", amount: 2100, method: "Insurance", date: "2024-01-20", status: "Completed" },
    { id: "PAY-003", invoice: "INV-002", patient: "Priya Sharma", amount: 3400, method: "Credit Card", date: "2024-01-18", status: "Processing" },
    { id: "PAY-004", invoice: "INV-005", patient: "Arjun Singh", amount: 1650, method: "Debit Card", date: "2024-01-22", status: "Processing" },
];


export default function PaymentPage() {
    const { onOpen } = useModal()

    const [open, setOpen] = useState(false);

    const handleProcessPayment = (e) => {
        e.preventDefault();
        toast.success("Payment processed successfully");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "bg-accent text-accent-foreground";
            case "Processing":
                return "bg-warning text-warning-foreground";
            case "Failed":
                return "bg-destructive text-destructive-foreground";
            default:
                return "bg-muted text-muted-foreground";
        }
    };



    return (



        <div className='absolute inset-0 flex flex-col gap-2 p-2'>
            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Payment Processing</h2>
                    <h2 className='text-xs text-white/50'>Process and track patient payments</h2>
                </div>
                <div>
                    <Button variant={'outline'} size={'sm'} className='' onClick={() => { onOpen('addinvoice') }}>
                        New Payment
                    </Button>
                </div>
            </div>


            {/* <div className='w-full dark:bg-[#151D24] p-4 rounded-lg border'>
                <DataTable columns={columns} data={tempData} />
            </div> */}
            <div className='h-full flex flex-grow w-full dark:bg-darkSecondaryBackground rounded-md py-2 overflow-hidden'>
                <ScrollArea className='h-[90vh] w-full p-2'>
                    <div className='flex flex-col gap-2'>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className='dark:bg-darkSecondaryBackground rounded-md'>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">$248,350</div>
                                    <p className="text-xs text-muted-foreground mt-1">This month</p>
                                </CardContent>
                            </Card>

                            <Card className='dark:bg-darkSecondaryBackground rounded-md'>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Processing</CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">$5,050</div>
                                    <p className="text-xs text-muted-foreground mt-1">2 payments pending</p>
                                </CardContent>
                            </Card>

                            <Card className='dark:bg-darkSecondaryBackground rounded-md'>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">98.5%</div>
                                    <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                            <Card className='dark:bg-darkSecondaryBackground rounded-md'>
                                <CardHeader>
                                    <CardTitle>Process New Payment</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleProcessPayment} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="invoiceId">Invoice ID</Label>
                                            <Input id="invoiceId" placeholder="Enter invoice ID" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="paymentAmount">Payment Amount ($)</Label>
                                            <Input id="paymentAmount" type="number" placeholder="0.00" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="paymentMethod">Payment Method</Label>
                                            <Select required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="credit">Credit Card</SelectItem>
                                                    <SelectItem value="debit">Debit Card</SelectItem>
                                                    <SelectItem value="insurance">Insurance</SelectItem>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="check">Check</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cardNumber">Card Number (if applicable)</Label>
                                            <Input id="cardNumber" placeholder="**** **** **** ****" />
                                        </div>
                                        <Button type="submit" className="w-full">Process Payment</Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className='dark:bg-darkSecondaryBackground rounded-md'>
                                <CardHeader>
                                    <CardTitle>Recent Payments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Payment ID</TableHead>
                                                <TableHead>Patient</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.slice(0, 4).map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell className="font-medium">{payment.id}</TableCell>
                                                    <TableCell>{payment.patient}</TableCell>
                                                    <TableCell>${payment.amount.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card className='dark:bg-darkSecondaryBackground rounded-md'>
                                <CardHeader>
                                    <CardTitle>Payment History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Payment ID</TableHead>
                                                <TableHead>Invoice</TableHead>
                                                <TableHead>Patient</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Method</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell className="font-medium">{payment.id}</TableCell>
                                                    <TableCell>{payment.invoice}</TableCell>
                                                    <TableCell>{payment.patient}</TableCell>
                                                    <TableCell>{payment.date}</TableCell>
                                                    <TableCell>${payment.amount.toLocaleString()}</TableCell>
                                                    <TableCell>{payment.method}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </ScrollArea>
            </div>

        </div>
    )
}
