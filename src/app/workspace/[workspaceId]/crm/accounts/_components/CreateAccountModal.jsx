'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2, Globe, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import { toast } from "sonner";
import { createAccountAction } from "../../_actions/account-actions";

export default function CreateAccountModal({ isOpen, onClose, workspaceId, onAccountCreated }) {
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [industry, setIndustry] = useState('Technology');
    const [size, setSize] = useState('11-50');
    const [website, setWebsite] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('India');
    const [annualRevenue, setAnnualRevenue] = useState('');
    const [rating, setRating] = useState('WARM');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Company name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await createAccountAction(workspaceId, {
                name: name.trim(),
                domain: domain.trim() || undefined,
                industry,
                size,
                website: website.trim() || undefined,
                phone: phone.trim() || undefined,
                email: email.trim() || undefined,
                city: city.trim() || undefined,
                country: country.trim() || undefined,
                annualRevenue: annualRevenue ? parseFloat(annualRevenue) : undefined,
                rating
            });

            if (res.success) {
                toast.success("Organization created successfully!");
                // Reset form
                setName('');
                setDomain('');
                setWebsite('');
                setPhone('');
                setEmail('');
                setCity('');
                setAnnualRevenue('');
                onClose();
                if (onAccountCreated) onAccountCreated(res.data);
            } else {
                toast.error(res.error || "Failed to create account");
            }
        } catch (error) {
            console.error("Create account error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <span>Add Organization / Company</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Create a B2B company record to group deals, contacts, and account telemetry.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                            Company Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="e.g., Acme Technologies Pvt Ltd"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-9 h-9 text-xs"
                                required
                            />
                        </div>
                    </div>

                    {/* Domain / Website */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Domain Name</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="acme.com"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Website URL</Label>
                            <Input
                                placeholder="https://acme.com"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>

                    {/* Industry & Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Industry</Label>
                            <Select value={industry} onValueChange={setIndustry}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Technology">Technology & SaaS</SelectItem>
                                    <SelectItem value="E-Commerce">E-Commerce & Retail</SelectItem>
                                    <SelectItem value="Healthcare">Healthcare & Pharma</SelectItem>
                                    <SelectItem value="Finance">Financial Services</SelectItem>
                                    <SelectItem value="Education">EdTech & Education</SelectItem>
                                    <SelectItem value="Real Estate">Real Estate & PropTech</SelectItem>
                                    <SelectItem value="Manufacturing">Manufacturing & Logistics</SelectItem>
                                    <SelectItem value="Agency">Marketing & Agency</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Company Size</Label>
                            <Select value={size} onValueChange={setSize}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1-10">1-10 Employees</SelectItem>
                                    <SelectItem value="11-50">11-50 Employees</SelectItem>
                                    <SelectItem value="51-200">51-200 Employees</SelectItem>
                                    <SelectItem value="201-500">201-500 Employees</SelectItem>
                                    <SelectItem value="500+">500+ Employees</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Company Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="+91 22 1234 5678"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Corporate Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="contact@acme.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* City & Rating */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">City / Region</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="e.g., Bangalore"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Account Tier / Rating</Label>
                            <Select value={rating} onValueChange={setRating}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HOT">🔥 Tier 1 / Hot Account</SelectItem>
                                    <SelectItem value="WARM">⚡ Tier 2 / Warm Account</SelectItem>
                                    <SelectItem value="COLD">❄️ Tier 3 / Cold Account</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Annual Revenue */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Estimated Annual Revenue (₹)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="number"
                                placeholder="e.g. 5000000"
                                value={annualRevenue}
                                onChange={(e) => setAnnualRevenue(e.target.value)}
                                className="pl-9 h-9 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Company"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
