'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Hospital, Stethoscope, User, Calendar, FileText, Shield, Phone, Mail,
    Clock, MapPin, AlertCircle, ArrowLeft, Search
} from 'lucide-react';

export default function ProfessionalNotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header Bar */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                            <Hospital className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Hospital Management System
                            </h1>
                            <p className="text-sm text-gray-600 font-medium">Enterprise Patient Portal</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Main Error Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-3 bg-white p-6 rounded-2xl shadow-xl border border-gray-200 max-w-sm">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                                    <AlertCircle className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <div className="text-5xl font-black text-gray-900 tracking-tight">404</div>
                                    <h2 className="text-3xl font-bold text-gray-900 mt-2">
                                        Resource Not Found
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-semibold text-gray-900">
                                Unable to locate requested record
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                                The patient record, appointment, or document you requested could not be found in our system.
                                This may be due to an incorrect identifier or the record has been archived.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                                <div className="text-center p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <Shield className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                                    <h4 className="font-semibold text-gray-900 mb-1">Secure Access</h4>
                                    <p className="text-sm text-gray-600">All records encrypted & HIPAA compliant</p>
                                </div>
                                <div className="text-center p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <Clock className="h-10 w-10 text-green-600 mx-auto mb-3" />
                                    <h4 className="font-semibold text-gray-900 mb-1">24/7 Support</h4>
                                    <p className="text-sm text-gray-600">Available round the clock</p>
                                </div>
                                <div className="text-center p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <FileText className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                                    <h4 className="font-semibold text-gray-900 mb-1">Audit Trail</h4>
                                    <p className="text-sm text-gray-600">Complete access logging</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Panel */}
                    <Card className="border-0 shadow-2xl overflow-hidden bg-white/70 backdrop-blur-xl">
                        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 text-center">
                            <CardTitle className="text-3xl font-bold tracking-tight">Quick Actions</CardTitle>
                            <CardDescription className="text-slate-300">
                                Navigate to frequently accessed areas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Primary Actions */}
                                <Link href="/dashboard/patients" className="group">
                                    <Button
                                        size="lg"
                                        className="w-full h-16 justify-start shadow-lg hover:shadow-xl group-hover:bg-blue-600/90 transition-all"
                                    >
                                        <User className="h-5 w-5 mr-3 text-blue-200 group-hover:text-white" />
                                        <span className="font-semibold text-left flex-1">Patient Records</span>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium group-hover:bg-white/20 group-hover:text-white">
                                            Most Popular
                                        </span>
                                    </Button>
                                </Link>

                                <Link href="/dashboard/appointments">
                                    <Button size="lg" className="w-full h-16 justify-start shadow-lg hover:shadow-xl">
                                        <Calendar className="h-5 w-5 mr-3 text-emerald-400" />
                                        <span className="font-semibold text-left flex-1">Appointments</span>
                                    </Button>
                                </Link>

                                <Link href="/dashboard/doctors">
                                    <Button size="lg" className="w-full h-16 justify-start shadow-lg hover:shadow-xl">
                                        <Stethoscope className="h-5 w-5 mr-3 text-purple-400" />
                                        <span className="font-semibold text-left flex-1">Physicians</span>
                                    </Button>
                                </Link>

                                <Link href="/dashboard">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full h-16 justify-start border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl"
                                    >
                                        <ArrowLeft className="h-5 w-5 mr-3 text-gray-600" />
                                        <span className="font-semibold text-left flex-1">Dashboard Home</span>
                                    </Button>
                                </Link>
                            </div>

                            {/* Support */}
                            <div className="pt-8 border-t border-gray-200 space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                                    <AlertCircle className="h-6 w-6 text-orange-600" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm">Need Assistance?</h4>
                                        <p className="text-sm text-gray-600 mb-2">Our support team is here 24/7</p>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <Button variant="ghost" size="sm" className="h-8 px-3">
                                                <Phone className="h-3 w-3 mr-1" />
                                                +1-800-555-0199
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 px-3">
                                                <Mail className="h-3 w-3 mr-1" />
                                                support@hospital.com
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <div className="mt-24 pt-12 border-t border-gray-200 text-center text-sm text-gray-500">
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-400" />
                            <span>HIPAA Compliant • SOC 2 Type II</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300 hidden md:block" />
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>System Uptime: 99.99%</span>
                        </div>
                    </div>
                    <p className="mt-4 opacity-75">
                        Hospital Management System Enterprise © 2025 | v2.4.1
                    </p>
                </div>
            </div>
        </div>
    );
}
