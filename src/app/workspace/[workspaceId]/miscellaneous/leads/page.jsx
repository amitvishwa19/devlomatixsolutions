// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MapPin,
    Globe,
    Smartphone,
    Mail,
    Star,
    RefreshCcw,
    Download,
    LayoutGrid,
    List,
    AlertCircle,
    CheckCircle2,
    Building2,
    Filter,
    Trash2,
    Send,
    Plus,
    History
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useParams } from 'next/navigation';
import { Country, State, City } from 'country-state-city';
import SaveContact from './_components/SaveContact';
import BulkActionBar from './_components/BulkActionBar';
import { bulkSaveLeadsAction } from './_actions/bulk-save';
import { Loader2, Save, ExternalLink } from 'lucide-react';

export default function LeadsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [searching, setSearching] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [leads, setLeads] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [contactGroups, setContactGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [saving, setSaving] = useState(false);
    const [selectedLeadIds, setSelectedLeadIds] = useState([]);
    const [stats, setStats] = useState({
        totalLeads: 0,
        withPhone: 0,
        withEmail: 0,
        avgRating: 0
    });

    const [filters, setFilters] = useState({
        keyword: '',
        category: 'all',
        country: 'IN', // Default to India
        state: '',
        city: '',
        pincode: ''
    });

    const [saveLeadsModal, setSaveLeadsModal] = useState({
        open: false,
        leads: [],
        selectedLeadIds: [],
        toggleModal: (data = null) => setSaveLeadsModal(prev => ({ ...prev, open: !prev.open, leads: data ? data : [], selectedLeadIds: data ? data.map(l => l.id) : [] }))
    });

    const [searchHistory, setSearchHistory] = useState([]);

    // Calculate displayed leads (10 per page)
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedLeads = leads.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil((leads.length + (nextPageToken ? 10 : 0)) / itemsPerPage); // Heuristic total pages


    // Load search history from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('leads_search_history');
        if (saved) {
            try {
                setSearchHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse search history", e);
            }
        }
    }, []);

    const saveSearchEntry = (newFilters) => {
        if (!newFilters.keyword.trim()) return;

        setSearchHistory(prev => {
            const entry = {
                keyword: newFilters.keyword,
                category: newFilters.category,
                country: newFilters.country,
                state: newFilters.state,
                city: newFilters.city,
                pincode: newFilters.pincode,
                timestamp: new Date().getTime()
            };

            const isDuplicate = prev.some(h =>
                h.keyword === entry.keyword &&
                h.city === entry.city &&
                h.category === entry.category &&
                h.pincode === entry.pincode
            );

            if (isDuplicate) return prev;

            const updated = [entry, ...prev].slice(0, 10);
            localStorage.setItem('leads_search_history', JSON.stringify(updated));
            return updated;
        });
    };

    const applyHistory = (entry) => {
        setFilters({
            keyword: entry.keyword || '',
            category: entry.category || 'all',
            country: entry.country || 'IN',
            state: entry.state || '',
            city: entry.city || '',
            pincode: entry.pincode || ''
        });
    };

    const deleteHistoryEntry = (e, timestamp) => {
        e.stopPropagation();
        setSearchHistory(prev => {
            const updated = prev.filter(h => h.timestamp !== timestamp);
            localStorage.setItem('leads_search_history', JSON.stringify(updated));
            return updated;
        });
    };

    const getHistoryLabel = (entry) => {
        const parts = [entry.keyword];
        if (entry.city) parts.push(`in ${entry.city}`);
        return parts.join(' ');
    };


    // Update stats based on all loaded leads
    useEffect(() => {
        if (leads.length > 0) {
            const withPhone = leads.filter(l => l.phone).length;
            const avgRating = (leads.reduce((acc, l) => acc + l.rating, 0) / (leads.length || 1)).toFixed(1);
            setStats({
                totalLeads: leads.length,
                withPhone,
                withEmail: 0,
                avgRating
            });
        }
    }, [leads]);

    const [allCountries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Fetch contact groups on mount
    useEffect(() => {
        fetchContactGroups();
    }, []);

    const fetchContactGroups = async () => {
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/contacts/groups`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setContactGroups(data);
                // Auto-select first group if none selected
                if (data.length > 0 && !selectedGroupId) {
                    setSelectedGroupId(data[0].id);
                }
            }
        } catch (error) {
            console.error("[LEADFINDER] Failed to fetch contact groups:", error);
        }
    };

    // Update states when country changes
    useEffect(() => {
        if (filters.country && filters.country !== 'all') {
            const countryStates = State.getStatesOfCountry(filters.country);
            setStates(countryStates);
            if (!countryStates.find(s => s.isoCode === filters.state)) {
                setFilters(prev => ({ ...prev, state: '', city: '' }));
            }
        } else {
            setStates([]);
            setFilters(prev => ({ ...prev, state: '', city: '' }));
        }
    }, [filters.country]);

    // Update cities when state changes
    useEffect(() => {
        if (filters.country && filters.state) {
            const stateCities = City.getCitiesOfState(filters.country, filters.state);
            setCities(stateCities);
            if (!stateCities.find(c => c.name === filters.city)) {
                setFilters(prev => ({ ...prev, city: '' }));
            }
        } else {
            setCities([]);
        }
    }, [filters.country, filters.state]);

    const categories = [
        { id: 'all', name: 'All Categories' },
        { id: 'realestate', name: 'Real Estate' },
        { id: 'technology', name: 'Technology' },
        { id: 'healthcare', name: 'Healthcare' },
        { id: 'retail', name: 'Retail & Consumer' },
        { id: 'finance', name: 'Finance & Legal' },
        { id: 'manufacturing', name: 'Manufacturing' },
        { id: 'education', name: 'Education' }
    ];

    const handleSaveLeads = async (leadsToSave) => {
        setSaving(true);
        const toastId = toast.loading(`Saving ${leadsToSave.length} leads to group...`);

        try {
            const res = await fetch(`/api/workspace/${workspaceId}/miscellaneous/leads/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: selectedGroupId,
                    leads: leadsToSave
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message || `Successfully saved leads to group!`, { id: toastId });
                fetchContactGroups(); // Refresh count
            } else {
                toast.error(data.error || "Failed to save leads", { id: toastId });
            }
        } catch (error) {
            toast.error("Network error saving leads", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleFindLeads = async (isNewSearch = true) => {
        if (!filters.keyword.trim()) {
            toast.error("Please enter a keyword to search");
            return;
        }

        if (isNewSearch) {
            saveSearchEntry(filters); // Save to history
            setSearching(true);
            setLeads([]);
            setCurrentPage(1);
            setNextPageToken(null);
        } else {
            setLoadingMore(true);
        }

        const toastId = toast.loading(isNewSearch ? "Connecting to Google Maps engine..." : "Fetching next batch from Google...");

        try {
            const selectedCountry = allCountries.find(c => c.isoCode === filters.country)?.name || '';
            const selectedState = states.find(s => s.isoCode === filters.state)?.name || '';

            const payload = {
                ...filters,
                country: selectedCountry,
                state: selectedState,
                pageToken: isNewSearch ? null : nextPageToken
            };

            const res = await fetch(`/api/workspace/${workspaceId}/miscellaneous/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.status === 429) {
                toast.error(data.message || "Please wait a moment before fetching more results.", { id: toastId });
                return;
            }

            if (data.success) {
                if (isNewSearch) {
                    console.log(data.leads)
                    setLeads(data.leads);
                    toast.success(`Found ${data.leads.length} initial leads!`, { id: toastId });
                } else {
                    setLeads(prev => [...prev, ...data.leads]);
                    toast.success(`Added ${data.leads.length} more leads to your collection!`, { id: toastId });
                }
                setNextPageToken(data.nextPageToken);
            } else {
                toast.error(data.message || "Extraction failed", { id: toastId });
            }
        } catch (error) {
            toast.error("Network error during extraction", { id: toastId });
        } finally {
            setSearching(false);
            setLoadingMore(false);
        }
    };

    const handleNextPage = () => {
        const nextIdx = currentPage * itemsPerPage;
        if (nextIdx < leads.length) {
            setCurrentPage(prev => prev + 1);
        } else if (nextPageToken) {
            handleFindLeads(false).then(() => {
                setCurrentPage(prev => prev + 1);
            });
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const toggleSelectAll = () => {
        if (selectedLeadIds.length === leads.length) {
            setSelectedLeadIds([]);
        } else {
            setSelectedLeadIds(leads.map(l => l.id));
        }
    };

    const toggleSelectLead = (id) => {
        setSelectedLeadIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleBulkSaveToCRM = async () => {
        if (selectedLeadIds.length === 0) return;
        setSaving(true);
        const selectedLeads = leads.filter(l => selectedLeadIds.includes(l.id));

        try {
            const result = await bulkSaveLeadsAction(workspaceId, selectedLeads);
            if (result.success) {
                toast.success(`Successfully saved ${result.results.saved} leads to CRM`);
                // Update local state to show as saved
                setLeads(prev => prev.map(l =>
                    selectedLeadIds.includes(l.id) ? { ...l, isSaved: true } : l
                ));
                setSelectedLeadIds([]);
            } else {
                toast.error(result.error || "Bulk save failed");
            }
        } catch (error) {
            toast.error("An unexpected error occurred during bulk save");
        } finally {
            setSaving(false);
        }
    };

    const handleExport = () => {
        if (leads.length === 0) return;

        const leadsToExport = selectedLeadIds.length > 0
            ? leads.filter(l => selectedLeadIds.includes(l.id))
            : leads;

        const headers = ["Name", "Phone", "Email", "Rating", "Reviews", "Address", "Website"];
        const csvContent = [
            headers.join(","),
            ...leadsToExport.map(l => [
                `"${l.name}"`,
                `"${l.phone}"`,
                `"${l.email}"`,
                l.rating,
                l.reviews,
                `"${l.address}"`,
                `"${l.website}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success(selectedLeadIds.length > 0 ? `Exported ${selectedLeadIds.length} selected leads` : "Exported all leads successfully");
    };

    return (
        <div className="p-4 space-y-4 animate-in fade-in duration-500  mx-auto">


            {/* Header / Branding */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary rounded-xl">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">LeadFinder</h1>
                            <p className="text-xs  text-muted-foreground  flex items-center gap-2 mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Google & Maps Lead Generator Engine
                            </p>
                        </div>
                    </div>

                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-card/50 border text-xs font-bold gap-2 flex-1 md:flex-initial rounded-md"
                        onClick={() => { setLeads([]); setStats({ totalLeads: 0, withPhone: 0, withEmail: 0, avgRating: 0 }); setCurrentPage(1); setNextPageToken(null); setSelectedLeadIds([]); }}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                    </Button>
                    <Button
                        disabled={leads.length === 0}
                        variant="secondary"
                        size="sm"
                        className="text-xs font-bold gap-2 flex-1 md:flex-initial rounded-md"
                        onClick={handleExport}
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Search History Tag Cloud */}
            {searchHistory.length > 0 && (
                <div className="space-y-2 animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 pl-1">
                        <History className="w-3 h-3" />
                        Recent Searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {searchHistory.map((entry, i) => (
                            <Badge
                                key={`${entry.timestamp}-${i}`}
                                variant="outline"
                                className="bg-primary/5 hover:bg-primary/20 border-primary/20 text-muted-foreground cursor-pointer transition-all hover:scale-105 active:scale-95 text-xs font-medium py-1 px-3 rounded-full flex items-center gap-2 group relative pr-7"
                                onClick={() => applyHistory(entry)}
                            >
                                <Search className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                                {getHistoryLabel(entry)}
                                <button
                                    onClick={(e) => deleteHistoryEntry(e, entry.timestamp)}
                                    className="absolute right-1.5 p-0.5 hover:bg-destructive/20 hover:text-destructive rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-2.5 h-2.5" />
                                </button>
                            </Badge>
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[9px] font-medium text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => { setSearchHistory([]); localStorage.removeItem('leads_search_history'); }}
                        >
                            Clear History
                        </Button>
                    </div>
                </div>
            )}

            {/* Search Filters Card */}
            <Card className="bg-card border backdrop-blur-md overflow-hidden relative group rounded-xl p-4">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                <CardHeader className="">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Filter className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-bold text-white">Advanced Search Filters</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-2">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground/70">Keyword</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="e.g. Restaurant, Dentist..."
                                        className="bg-background/20 border text-xs h-11 pl-9 focus:border-primary/50 transition-all font-medium text-white rounded-md"
                                        value={filters.keyword}
                                        onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFindLeads()}
                                    />
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground/70">Category</Label>
                                <Select value={filters.category} onValueChange={(val) => setFilters({ ...filters, category: val })}>
                                    <SelectTrigger className="bg-background/20 border text-xs h-11 font-medium text-white rounded-md">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border">
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id} className="text-xs">{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground/70">Country</Label>
                                <Select value={filters.country} onValueChange={(val) => setFilters({ ...filters, country: val })}>
                                    <SelectTrigger className="bg-background/20 border text-xs h-11 font-medium text-white rounded-md">
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border">
                                        {allCountries.map(c => (
                                            <SelectItem key={c.isoCode} value={c.isoCode} className="text-xs">{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground/70">State / Region</Label>
                                <Select
                                    value={filters.state}
                                    onValueChange={(val) => setFilters({ ...filters, state: val })}
                                    disabled={states.length === 0}
                                >
                                    <SelectTrigger className="bg-background/20 border text-xs h-11 font-medium text-white rounded-md">
                                        <SelectValue placeholder={states.length > 0 ? "Select State" : "N/A"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border">
                                        {states.map(s => (
                                            <SelectItem key={s.isoCode} value={s.isoCode} className="text-xs">{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-2 items-center">

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground/70">City</Label>
                                <Select
                                    value={filters.city}
                                    onValueChange={(val) => setFilters({ ...filters, city: val })}
                                    disabled={cities.length === 0}
                                >
                                    <SelectTrigger className="bg-background/20 border text-xs h-11 font-medium text-white rounded-md">
                                        <SelectValue placeholder={cities.length > 0 ? "Select City" : "N/A"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border">
                                        <ScrollArea className="h-72">
                                            {cities.map(c => (
                                                <SelectItem key={c.name} value={c.name} className="text-xs">{c.name}</SelectItem>
                                            ))}
                                        </ScrollArea>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground/70">Pincode</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="e.g. 94102"
                                        className="bg-background/20 border text-xs h-11 pl-9 font-medium text-white rounded-md"
                                        value={filters.pincode}
                                        onChange={(e) => setFilters({ ...filters, pincode: e.target.value })}
                                    />
                                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button
                                    onClick={() => handleFindLeads(true)}
                                    disabled={searching}
                                    className="w-full h-10  bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-3 overflow-hidden group rounded-md"
                                >
                                    <AnimatePresence mode="wait">
                                        {searching ? (
                                            <motion.div
                                                key="searching"
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <RefreshCcw className="w-4 h-4 animate-spin" />
                                                <span>Searching...</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="idle"
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Find Leads</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </div>
                        </div>


                    </div>
                </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Leads", value: stats.totalLeads, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "With Phone", value: stats.withPhone, icon: Smartphone, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "With Email", value: stats.withEmail, icon: Mail, color: "text-purple-400", bg: "bg-purple-500/10" },
                    { label: "Avg Rating", value: stats.avgRating, suffix: "/5", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="bg-card border backdrop-blur-sm group hover:border-primary/30 transition-all overflow-hidden relative">
                            <div className={`absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
                                <stat.icon className="w-16 h-16" />
                            </div>
                            <CardContent className="p-2">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 ${stat.bg} rounded-xl border`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground/60">{stat.label}</p>
                                        <div className="flex items-baseline gap-1">
                                            <h3 className="text-2xl font-bold text-white tracking-tighter">
                                                <AnimatePresence mode="wait">
                                                    <motion.span
                                                        key={`${stat.label}-${stat.value}`}
                                                        initial={{ opacity: 0, scale: 1.2 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                    >
                                                        {stat.value}
                                                    </motion.span>
                                                </AnimatePresence>
                                            </h3>
                                            {stat.suffix && <span className="text-xs font-bold text-muted-foreground">{stat.suffix}</span>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Results Table Area */}
            <Card className="bg-card border backdrop-blur-md overflow-hidden flex-1 shadow-2xl flex flex-col  p-0 rounded-xl">

                <CardHeader className="border-b py-4 px-6 flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <LayoutGrid className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold">Extraction Results</CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">Manage and export your discovered leads</p>
                        </div>
                    </div>

                    {leads.length > 0 && (
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            {contactGroups.length > 0 ? (
                                <div className="flex items-center gap-3 bg-zinc-900/50 p-1.5 pl-3 rounded-xl border w-full lg:w-auto shadow-inner">
                                    <Label className="text-xs font-bold text-muted-foreground/70 whitespace-nowrap flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        Save to Group:
                                    </Label>
                                    <Select value={selectedGroupId} onValueChange={setSelectedGroupId} disabled={saving}>
                                        <SelectTrigger className="bg-background/40 border-none text-[11px] h-8 w-full lg:w-[180px] font-bold text-white transition-all hover:bg-background/60">
                                            <SelectValue placeholder="Choose Destination" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border">
                                            {contactGroups.map(group => (
                                                <SelectItem key={group.id} value={group.id} className="text-xs group">
                                                    <span className="flex items-center justify-between w-full gap-4">
                                                        {group.name}
                                                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-white/10 opacity-60">
                                                            {group._count?.contacts || 0}
                                                        </Badge>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-500/80 text-xs font-bold">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    No contact groups found
                                </div>
                            )}
                            <Button
                                size="sm"
                                disabled={leads.length === 0 || saving}
                                onClick={() => setSaveLeadsModal({
                                    open: true,
                                    leads: selectedLeadIds.length > 0 ? leads.filter(l => selectedLeadIds.includes(l.id)) : leads,
                                    selectedLeadIds: selectedLeadIds.length > 0 ? selectedLeadIds : leads.map(l => l.id)
                                })}
                                className="bg-primary/90 hover:bg-primary text-white font-bold text-xs  px-6 shadow-lg shadow-primary/20 transition-all active:scale-95 group relative overflow-hidden rounded-md"
                            >
                                {saving ? (
                                    <RefreshCcw className="w-3.5 h-3.5 animate-spin mr-2" />
                                ) : (
                                    <div className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {selectedLeadIds.length > 0 ? `Save Selected (${selectedLeadIds.length})` : "Save All Results"}
                                    </div>
                                )}
                            </Button>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-0 flex-1 flex flex-col relative -mt-6 overflow-hidden">
                    <ScrollArea className="flex-1">


                        {leads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12 opacity-80">
                                <div className="w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5 animate-pulse">
                                    <MapPin className="w-10 h-10 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Find Business Leads Instantly</h3>
                                <p className="text-xs text-muted-foreground/70 max-w-sm font-medium leading-relaxed  ">
                                    Select a location and category above to discover businesses directly from Google and Google Maps. Export with contact info in one click.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-black/40 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4 pl-6 w-10">
                                                <div
                                                    className={`w-4 h-4 border rounded cursor-pointer flex items-center justify-center transition-colors ${selectedLeadIds.length === leads.length ? 'bg-primary border-primary' : 'bg-transparent border-white/20'}`}
                                                    onClick={toggleSelectAll}
                                                >
                                                    {selectedLeadIds.length === leads.length && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                </div>
                                            </th>
                                            <th className="p-4 text-xs font-bold text-muted-foreground">Business Info</th>
                                            <th className="p-4 text-xs font-bold text-muted-foreground">Contact Details</th>
                                            <th className="p-4 text-xs font-bold text-muted-foreground">Reputation</th>
                                            <th className="p-4 text-xs font-bold text-muted-foreground">Location</th>
                                            <th className="p-4 pr-6 text-right text-xs font-bold text-muted-foreground min-w-[150px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/10">
                                        <AnimatePresence initial={false}>
                                            {displayedLeads.map((lead, idx) => (
                                                <motion.tr
                                                    key={lead.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="group hover:bg-white/5"
                                                >
                                                    <td className="p-4 pl-6">
                                                        <div
                                                            className={`w-4 h-4 border rounded cursor-pointer flex items-center justify-center transition-colors ${selectedLeadIds.includes(lead.id) ? 'bg-primary border-primary' : 'bg-transparent border-white/20'}`}
                                                            onClick={() => toggleSelectLead(lead.id)}
                                                        >
                                                            {selectedLeadIds.includes(lead.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 w-160">
                                                        <div className="flex items-center gap-3">

                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm mb-0.5 ">{lead.name}</p>
                                                                    {lead.isSaved && (
                                                                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-bold rounded">
                                                                            SAVED
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <Badge variant="outline" className="text-xs capitalize font-semibold py-0 h-4 bg-primary/5 text-primary border-primary/20 rounded-md">
                                                                    {lead.category}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="space-y-1.5">
                                                            {lead.phone && (
                                                                <div className="flex items-center gap-2 text-xs  font-medium  group/info hover:text-emerald-400 transition-colors cursor-pointer">
                                                                    <Smartphone className="w-4 h-4 text-emerald-500/70" />
                                                                    {lead.phone}
                                                                </div>
                                                            )}
                                                            {lead.email && (
                                                                <div className="flex items-center gap-2 text-xs  font-medium  group/info hover:text-purple-400 transition-colors cursor-pointer">
                                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                                    {lead.email}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/20">
                                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                                <span className="text-xs font-bold text-amber-500">{lead.rating}</span>
                                                            </div>
                                                            <span className="text-xs font-bold text-muted-foreground">{lead.reviews} reviews</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="w-80">
                                                            <p className="text-xs font-medium text-muted-foreground leading-relaxed  transition-all">
                                                                {lead.address}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 pr-6 text-right">
                                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="w-8 h-8 rounded-lg bg-zinc-900 border hover:bg-zinc-800"
                                                                onClick={() => window.open(`https://wa.me/${lead.phone?.replace(/\D/g, '')}`, '_blank')}
                                                                disabled={!lead.phone}
                                                                title="Quick WhatsApp Chat"
                                                            >
                                                                <Smartphone className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                disabled={saving || lead.isSaved}
                                                                size="sm"
                                                                variant={lead.isSaved ? "secondary" : "outline"}
                                                                className="h-8 text-xs font-bold gap-1.5 rounded-lg"
                                                                onClick={() => setSaveLeadsModal(prev => ({
                                                                    ...prev,
                                                                    open: true,
                                                                    leads: [lead],
                                                                    selectedLeadIds: [lead.id]
                                                                }))}
                                                            >
                                                                {lead.isSaved ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                                                                {lead.isSaved ? "Saved" : "Save"}
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-primary rounded-lg transition-colors" asChild title="View Website">
                                                                <a href={lead.website} target="_blank" rel="noreferrer">
                                                                    <Globe className="w-3.5 h-3.5" />
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Animated Overlay during Search */}
                    <AnimatePresence>
                        {(searching || loadingMore) && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center space-y-6"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin shadow-2xl shadow-primary/30" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Search className="w-7 h-7 text-primary animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-2 text-center">
                                    <p className="text-sm font-black text-white   animate-pulse">
                                        {searching ? "Extracting Intelligence" : "Fetching Next Batch"}
                                    </p>
                                    <p className="text-xs text-muted-foreground/80 font-bold  ">Consulting Google Maps API • Scraping Contact Details</p>
                                </div>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                            className="w-1.5 h-1.5 rounded-full bg-primary"
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>

                <BulkActionBar
                    selectedLeadIds={selectedLeadIds}
                    leads={leads}
                    saving={saving}
                    onClear={() => setSelectedLeadIds([])}
                    onExport={handleExport}
                    onSave={setSaveLeadsModal}
                />

                <CardFooter className="bg-black/20 border-t border-border/10 py-3 px-6 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <p className="text-xs font-bold text-muted-foreground  ">
                            {leads.length > 0 ? `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, leads.length)} of ${leads.length} found` : "System Standby"}
                        </p>
                        {nextPageToken && (
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black   animate-pulse">
                                More Available
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1 || searching || loadingMore}
                            onClick={handlePrevPage}
                            className="bg-zinc-900 border-border/40 text-xs font-black   h-8 px-4"
                        >
                            Previous
                        </Button>
                        <div className="flex items-center justify-center bg-zinc-900 border border-border/40 rounded-md h-8 px-4">
                            <span className="text-xs font-black text-primary ">Page {currentPage}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={(startIndex + itemsPerPage >= leads.length && !nextPageToken) || searching || loadingMore}
                            onClick={handleNextPage}
                            className="bg-zinc-900 border-border/40 text-xs font-black   h-8 px-4"
                        >
                            {startIndex + itemsPerPage >= leads.length && nextPageToken ? "Fetch More" : "Next"}
                        </Button>
                    </div>
                </CardFooter>
            </Card >

            <SaveContact
                open={saveLeadsModal.open}
                setOpen={(val) => {
                    if (typeof val === 'boolean') {
                        setSaveLeadsModal(prev => ({ ...prev, open: val }));
                    } else {
                        setSaveLeadsModal(val);
                    }
                }}
                leads={saveLeadsModal.leads}
                selectedLeadIds={saveLeadsModal.selectedLeadIds}
                onSuccess={() => {
                    setSelectedLeadIds([]);
                    handleFindLeads(false); // Refresh badges without clearing results
                }}
            />

        </div >
    );
}
