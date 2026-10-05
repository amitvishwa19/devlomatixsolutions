'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    Plus,
    Search,
    Filter,
    Globe,
    Phone,
    Mail,
    Users,
    TrendingUp,
    MapPin,
    DollarSign,
    Trash2,
    ChevronRight,
    Loader2,
    RefreshCw,
    ExternalLink,
    Briefcase
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import CreateAccountModal from './_components/CreateAccountModal';
import { getAccountsAction, deleteAccountAction } from '../_actions/account-actions';

export default function AccountsDirectoryPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [industryFilter, setIndustryFilter] = useState('ALL');
    const [ratingFilter, setRatingFilter] = useState('ALL');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const loadAccounts = async (showToast = false) => {
        if (!workspaceId) return;
        try {
            if (showToast) setIsRefreshing(true);
            else setIsLoading(true);

            const res = await getAccountsAction(workspaceId, {
                industry: industryFilter === 'ALL' ? undefined : industryFilter,
                rating: ratingFilter === 'ALL' ? undefined : ratingFilter,
                search: searchQuery || undefined
            });

            if (res.success) {
                setAccounts(res.data);
            } else {
                toast.error(res.error || "Failed to load accounts");
            }
            if (showToast) toast.success("Accounts refreshed");
        } catch (error) {
            console.error("Load accounts error:", error);
            toast.error("Error loading accounts");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadAccounts();
    }, [workspaceId, industryFilter, ratingFilter]);

    const filteredAccounts = useMemo(() => {
        if (!searchQuery.trim()) return accounts;
        const q = searchQuery.toLowerCase();
        return accounts.filter(acc =>
            acc.name.toLowerCase().includes(q) ||
            acc.domain?.toLowerCase().includes(q) ||
            acc.city?.toLowerCase().includes(q) ||
            acc.industry?.toLowerCase().includes(q)
        );
    }, [accounts, searchQuery]);

    // Metrics computation
    const metrics = useMemo(() => {
        const total = accounts.length;
        const hotAccounts = accounts.filter(a => a.rating === 'HOT').length;
        const totalContacts = accounts.reduce((sum, a) => sum + (a._count?.contacts || 0), 0);
        const totalPipelineValue = accounts.reduce((sum, a) => {
            const accValue = (a.deals || []).reduce((dSum, d) => dSum + (d.value || 0), 0);
            return sum + accValue;
        }, 0);

        return { total, hotAccounts, totalContacts, totalPipelineValue };
    }, [accounts]);

    const handleDeleteAccount = async (e, accountId, accountName) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete company "${accountName}"? All linked contacts and deals will be unlinked.`)) return;

        try {
            const res = await deleteAccountAction(workspaceId, accountId);
            if (res.success) {
                toast.success("Company deleted");
                loadAccounts();
            } else {
                toast.error(res.error || "Failed to delete company");
            }
        } catch (error) {
            toast.error("Error deleting company");
        }
    };

    const formatCurrency = (val) => {
        return `₹ ${Number(val || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-background p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-black tracking-tight text-foreground">
                            B2B Organizations & Companies
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Manage client organizations, linked contact networks, and enterprise pipeline value.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-semibold"
                        onClick={() => loadAccounts(true)}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>
                    <Button
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Company</span>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Companies</p>
                    <p className="text-2xl font-black text-foreground">{metrics.total}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">B2B client accounts</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Total Pipeline Value</p>
                    <p className="text-2xl font-black text-emerald-500">{formatCurrency(metrics.totalPipelineValue)}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Across all company deals</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">🔥 Hot Tier Accounts</p>
                    <p className="text-2xl font-black text-foreground">{metrics.hotAccounts}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">High-priority enterprise clients</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Linked Stakeholders</p>
                    <p className="text-2xl font-black text-foreground">{metrics.totalContacts}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Mapped contacts & decision-makers</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/70">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search company name, domain, city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs bg-background border-border/80"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Select value={industryFilter} onValueChange={setIndustryFilter}>
                        <SelectTrigger className="h-9 w-[140px] text-xs bg-background border-border/80">
                            <SelectValue placeholder="Industry" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Industries</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Real Estate">Real Estate</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger className="h-9 w-[130px] text-xs bg-background border-border/80">
                            <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Tiers</SelectItem>
                            <SelectItem value="HOT">🔥 Hot</SelectItem>
                            <SelectItem value="WARM">⚡ Warm</SelectItem>
                            <SelectItem value="COLD">❄️ Cold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Accounts Table */}
            <div className="border border-border/70 rounded-2xl bg-card overflow-hidden shadow-xs">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs font-semibold text-muted-foreground">Loading organizations...</p>
                    </div>
                ) : filteredAccounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="p-3 rounded-2xl bg-muted text-muted-foreground mb-3">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">No companies registered</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mt-1">
                            {searchQuery ? "No organizations match your search." : "Create your first B2B company record to group deals and contacts."}
                        </p>
                        <Button
                            size="sm"
                            className="mt-4 text-xs font-semibold"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Add Company
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Company Name</th>
                                    <th className="py-3 px-4">Industry & Size</th>
                                    <th className="py-3 px-4">Tier</th>
                                    <th className="py-3 px-4">Mapped Contacts</th>
                                    <th className="py-3 px-4">Deals & Value</th>
                                    <th className="py-3 px-4">Location</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredAccounts.map((account) => {
                                    const accountDealsValue = (account.deals || []).reduce((sum, d) => sum + (d.value || 0), 0);
                                    return (
                                        <tr
                                            key={account.id}
                                            className="hover:bg-muted/40 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/workspace/${workspaceId}/crm/accounts/${account.id}`)}
                                        >
                                            {/* Name & Domain */}
                                            <td className="py-3.5 px-4 font-bold text-foreground">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-xs shrink-0">
                                                        {account.name?.charAt(0)?.toUpperCase() || 'C'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground">{account.name}</div>
                                                        {account.domain && (
                                                            <div className="text-[11px] text-muted-foreground font-mono font-normal flex items-center gap-1">
                                                                <Globe className="w-2.5 h-2.5" />
                                                                {account.domain}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Industry & Size */}
                                            <td className="py-3.5 px-4 text-muted-foreground">
                                                <div className="space-y-0.5">
                                                    <div className="font-semibold text-foreground">{account.industry || 'General'}</div>
                                                    <div className="text-[10px]">{account.size || '11-50'} employees</div>
                                                </div>
                                            </td>

                                            {/* Rating */}
                                            <td className="py-3.5 px-4">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[10px] font-bold uppercase ${
                                                        account.rating === 'HOT' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                        account.rating === 'WARM' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                    }`}
                                                >
                                                    {account.rating === 'HOT' ? '🔥 Hot' : account.rating === 'WARM' ? '⚡ Warm' : '❄️ Cold'}
                                                </Badge>
                                            </td>

                                            {/* Linked Contacts */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5 font-bold text-foreground">
                                                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span>{account._count?.contacts || 0}</span>
                                                    <span className="text-[10px] text-muted-foreground font-normal">contacts</span>
                                                </div>
                                            </td>

                                            {/* Deals & Value */}
                                            <td className="py-3.5 px-4">
                                                <div>
                                                    <div className="font-bold text-foreground">{formatCurrency(accountDealsValue)}</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {account._count?.deals || 0} {account._count?.deals === 1 ? 'deal' : 'deals'}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Location */}
                                            <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                                                {account.city ? (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                                        <span>{account.city}{account.country ? `, ${account.country}` : ''}</span>
                                                    </div>
                                                ) : '—'}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs font-semibold text-primary hover:text-primary gap-1"
                                                        onClick={() => router.push(`/workspace/${workspaceId}/crm/accounts/${account.id}`)}
                                                    >
                                                        Dossier
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        title="Delete Organization"
                                                        onClick={(e) => handleDeleteAccount(e, account.id, account.name)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Account Modal */}
            <CreateAccountModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                workspaceId={workspaceId}
                onAccountCreated={() => loadAccounts(true)}
            />
        </div>
    );
}
