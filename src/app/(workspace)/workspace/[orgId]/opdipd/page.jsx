'use client'
import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
//import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, } from "recharts";
import { toast } from "sonner";

const revenueData = [
    { month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
    { month: "Feb", revenue: 52000, expenses: 35000, profit: 17000 },
    { month: "Mar", revenue: 48000, expenses: 33000, profit: 15000 },
    { month: "Apr", revenue: 61000, expenses: 38000, profit: 23000 },
    { month: "May", revenue: 55000, expenses: 36000, profit: 19000 },
    { month: "Jun", revenue: 67000, expenses: 40000, profit: 27000 },
];

const departmentRevenue = [
    { department: "Cardiology", revenue: 85000 },
    { department: "Orthopedics", revenue: 72000 },
    { department: "Neurology", revenue: 68000 },
    { department: "Pediatrics", revenue: 54000 },
    { department: "Emergency", revenue: 92000 },
];


export default function ReportPage() {

    const handleGenerateReport = () => {
        toast.success("Report generated and ready for download");
    };


    return (
        <ScrollArea className='absolute inset-0 '>

            <div className='flex flex-col gap-2'>
                <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-lg border flex flex-row items-center justify-between'>
                    <div>
                        <h2 className='text-xl'>OPD/IPD Management</h2>
                        <h2 className='text-xs text-white/50'>Manage outpatient and inpatient workflows</h2>
                    </div>

                </div>

                <div className='dark:bg-darkSecondaryBackground rounded-md'>

                    <Card className='dark:bg-darkSecondaryBackground '>
                        <CardHeader>
                            <CardTitle>Generate Custom Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reportType">Report Type</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="revenue">Revenue Report</SelectItem>
                                            <SelectItem value="expenses">Expenses Report</SelectItem>
                                            <SelectItem value="profit">Profit & Loss</SelectItem>
                                            <SelectItem value="claims">Claims Summary</SelectItem>
                                            <SelectItem value="payments">Payment Analysis</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="period">Time Period</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="week">Last Week</SelectItem>
                                            <SelectItem value="month">Last Month</SelectItem>
                                            <SelectItem value="quarter">Last Quarter</SelectItem>
                                            <SelectItem value="year">Last Year</SelectItem>
                                            <SelectItem value="custom">Custom Range</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="format">Export Format</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF</SelectItem>
                                            <SelectItem value="excel">Excel</SelectItem>
                                            <SelectItem value="csv">CSV</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={() => { }} className="w-full gap-2">
                                        <Download className="h-4 w-4" />
                                        Generate
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>



                </div>

            </div>


        </ScrollArea >
    )
}
