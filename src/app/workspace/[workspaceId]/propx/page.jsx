'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Key, 
  DollarSign, 
  Wrench, 
  Plus, 
  Search, 
  MessageSquare, 
  FileSignature, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Sparkles,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

const initialUnits = [
  {
    id: "UNIT-14B",
    building: "The Heights Luxury Tower",
    tenant: "Alexander Wright",
    rent: "$3,400 /mo",
    leaseEnd: "Nov 30, 2027",
    status: "Paid",
    whatsappReminded: true,
    maintenanceRequests: 0,
  },
  {
    id: "UNIT-402",
    building: "Skyline Financial Centre",
    tenant: "Apex Media Corporate",
    rent: "$8,900 /mo",
    leaseEnd: "Mar 15, 2028",
    status: "Due in 3 Days",
    whatsappReminded: true,
    maintenanceRequests: 0,
  },
  {
    id: "UNIT-108",
    building: "Palm Grove Residencies",
    tenant: "Priya & Rohan Sengupta",
    rent: "$2,200 /mo",
    leaseEnd: "Aug 31, 2027",
    status: "Paid",
    whatsappReminded: true,
    maintenanceRequests: 1,
  },
  {
    id: "UNIT-215",
    building: "The Heights Luxury Tower",
    tenant: "Marcus Vance",
    rent: "$2,850 /mo",
    leaseEnd: "Dec 31, 2026",
    status: "Overdue",
    whatsappReminded: false,
    maintenanceRequests: 0,
  },
  {
    id: "UNIT-501",
    building: "Centennial Tech Hub",
    tenant: "Nexus BioSystems",
    rent: "$14,500 /mo",
    leaseEnd: "Sep 30, 2029",
    status: "Paid",
    whatsappReminded: true,
    maintenanceRequests: 2,
  },
  {
    id: "UNIT-304",
    building: "Palm Grove Residencies",
    tenant: "Vacant (Turnover Ready)",
    rent: "$2,100 /mo",
    leaseEnd: "Immediate",
    status: "Vacant",
    whatsappReminded: false,
    maintenanceRequests: 0,
  }
];

export default function PropXWorkspaceDashboard() {
  const params = useParams();
  const workspaceId = params?.workspaceId;

  const [units, setUnits] = useState(initialUnits);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredUnits = units.filter((u) => {
    const matchesSearch = 
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.tenant.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "occupied") return matchesSearch && u.status !== "Vacant";
    if (activeTab === "overdue") return matchesSearch && (u.status === "Overdue" || u.status === "Due in 3 Days");
    if (activeTab === "vacant") return matchesSearch && u.status === "Vacant";
    return matchesSearch;
  });

  const sendWhatsAppReminder = (id, tenant) => {
    toast.success(`KonnectX WhatsApp Rent Invoice & Payment link dispatched to ${tenant}!`);
    setUnits(prev => prev.map(u => u.id === id ? { ...u, whatsappReminded: true } : u));
  };

  const broadcastAllReminders = () => {
    toast.success("Broadcasted WhatsApp rent notices to all due and pending tenant accounts!");
    setUnits(prev => prev.map(u => ({ ...u, whatsappReminded: true })));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl text-foreground">
              Prop<span className="text-amber-500">X</span> Asset Cloud
            </h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/25 text-[10px]">
              Institutional Portfolio
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real estate asset management, digital lease generation, and KonnectX WhatsApp rent collection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={broadcastAllReminders}
            className="text-xs font-semibold border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Broadcast WhatsApp Notices
          </Button>

          <Button
            size="sm"
            onClick={() => toast.success("Property Asset onboarding wizard initialized.")}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Property
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/75 border-border/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Portfolio Units</span>
            <Building2 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">340 <span className="text-xs font-normal text-muted-foreground">Units</span></div>
            <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">98.4% Occupancy Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-card/75 border-border/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Monthly Rent Inflow</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">$428,500</div>
            <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">99.2% Collection SLA</p>
          </CardContent>
        </Card>

        <Card className="bg-card/75 border-border/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Open Maintenance</span>
            <Wrench className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">3 <span className="text-xs font-normal text-muted-foreground">Tickets</span></div>
            <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">All vendors dispatched</p>
          </CardContent>
        </Card>

        <Card className="bg-card/75 border-border/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Institutional Cap Rate</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">8.4%</div>
            <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">+1.8% vs City Benchmark</p>
          </CardContent>
        </Card>
      </div>

      {/* Units & Lease Roll Table */}
      <Card className="border-border/60 bg-card/70">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Active Units & Tenant Leases</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Manage lease terms, payment collection status, and dispatch WhatsApp payment links via KonnectX.
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search unit, tenant, or building..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-background/80"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
            <TabsList className="bg-muted/50 p-0.5 h-8">
              <TabsTrigger value="all" className="text-xs px-3">All Units ({units.length})</TabsTrigger>
              <TabsTrigger value="occupied" className="text-xs px-3">Occupied</TabsTrigger>
              <TabsTrigger value="overdue" className="text-xs px-3">Action Required</TabsTrigger>
              <TabsTrigger value="vacant" className="text-xs px-3">Vacant</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-5 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-3">Unit ID</th>
                  <th className="py-3 px-3">Building Asset</th>
                  <th className="py-3 px-3">Tenant & Lease End</th>
                  <th className="py-3 px-3">Monthly Rent</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Maintenance</th>
                  <th className="py-3 px-3 text-right">Rent Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredUnits.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-500">{u.id}</td>
                    <td className="py-3 px-3 font-semibold text-foreground">{u.building}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">{u.tenant}</div>
                      <div className="text-[11px] text-muted-foreground">Expires: {u.leaseEnd}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground">{u.rent}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          u.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : u.status === "Overdue"
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : u.status === "Vacant"
                            ? "bg-muted text-muted-foreground border-border/40"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      {u.maintenanceRequests > 0 ? (
                        <span className="text-[11px] font-semibold text-orange-500 flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          {u.maintenanceRequests} Open
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.status === "Vacant" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.info(`Generating tenant application link for ${u.id}`)}
                          className="h-7 text-[11px] px-2.5 cursor-pointer"
                        >
                          List Unit
                        </Button>
                      ) : u.whatsappReminded ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Notified
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendWhatsAppReminder(u.id, u.tenant)}
                          className="h-7 text-[11px] px-2.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Send WhatsApp
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
