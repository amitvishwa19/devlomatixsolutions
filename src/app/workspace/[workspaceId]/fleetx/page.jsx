'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  MapPin, 
  Fuel, 
  ShieldCheck, 
  Plus, 
  Search, 
  MessageSquare, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Clock,
  Gauge
} from 'lucide-react';
import { toast } from 'sonner';

const initialDispatches = [
  {
    id: "DISP-9401",
    rig: "RIG-8024 (Volvo FH16)",
    driver: "Devendra Sharma",
    origin: "Bhiwandi Hub (Mumbai)",
    destination: "Indirapuram Logistics Park (Delhi)",
    status: "In Transit",
    eta: "4h 15m",
    fuelStatus: "Optimal (84%)",
    speed: "64 km/h",
    whatsappNotified: true,
  },
  {
    id: "DISP-9402",
    rig: "RIG-3190 (Tata Prima)",
    driver: "Ramesh Patel",
    origin: "Electronic City (Bangalore)",
    destination: "Ennore Seaport (Chennai)",
    status: "Auto-Rerouted",
    eta: "1h 30m",
    fuelStatus: "Optimal (72%)",
    speed: "58 km/h",
    whatsappNotified: true,
  },
  {
    id: "DISP-9403",
    rig: "RIG-5512 (BharatBenz)",
    driver: "Jaspreet Singh",
    origin: "Sanand Auto Corridor (Ahmedabad)",
    destination: "Manesar Warehouse (Gurugram)",
    status: "In Transit",
    eta: "6h 45m",
    fuelStatus: "Refueled (+120L)",
    speed: "68 km/h",
    whatsappNotified: false,
  },
  {
    id: "DISP-9404",
    rig: "RIG-2218 (Ashok Leyland)",
    driver: "Vikram Jadhav",
    origin: "Chakan Industrial Zone (Pune)",
    destination: "JNPT Harbor Terminal (Navi Mumbai)",
    status: "Arrived",
    eta: "Delivered",
    fuelStatus: "Optimal (45%)",
    speed: "0 km/h (Docked)",
    whatsappNotified: true,
  },
  {
    id: "DISP-9405",
    rig: "RIG-7703 (Eicher Pro)",
    driver: "Amit Verma",
    origin: "Sri City SEZ (Tirupati)",
    destination: "Secunderabad Rail Yard (Hyderabad)",
    status: "Geofence Check",
    eta: "3h 10m",
    fuelStatus: "Idle 12m",
    speed: "0 km/h",
    whatsappNotified: false,
  }
];

export default function FleetXWorkspaceDashboard() {
  const params = useParams();
  const workspaceId = params?.workspaceId;

  const [dispatches, setDispatches] = useState(initialDispatches);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredDispatches = dispatches.filter((d) => {
    const matchesSearch = 
      d.rig.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "transit") return matchesSearch && (d.status === "In Transit" || d.status === "Auto-Rerouted");
    if (activeTab === "arrived") return matchesSearch && d.status === "Arrived";
    if (activeTab === "alert") return matchesSearch && d.status === "Geofence Check";
    return matchesSearch;
  });

  const triggerWhatsAppAlert = (id, driver) => {
    toast.success(`KonnectX WhatsApp Delivery ETA notification dispatched to customer for ${id}!`);
    setDispatches(prev => prev.map(item => item.id === id ? { ...item, whatsappNotified: true } : item));
  };

  const optimizeRoutes = () => {
    toast.info("FleetX AI Solver analyzing current highway congestion... 2 corridors optimized!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Fleet<span className="text-sky-500">X</span> Command Hub
            </h1>
            <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/25 text-[10px]">
              CAN-Bus Live
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time commercial fleet telemetry, autonomous routing, and KonnectX WhatsApp tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={optimizeRoutes}
            className="text-xs font-semibold border-sky-500/30 hover:bg-sky-500/10 text-sky-500 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            AI Reroute All
          </Button>

          <Button
            size="sm"
            onClick={() => toast.success("New Dispatch e-Manifest wizard opened.")}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-500/20 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Dispatch
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/75 border-border/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Rigs</span>
            <Truck className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">148 <span className="text-xs font-normal text-muted-foreground">/ 152</span></div>
            <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">97.3% Fleet Utilization</p>
          </CardContent>
        </Card>

        <Card className="bg-card/75 border-border/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">On-Time SLA</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">99.4%</div>
            <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">+1.2% over target</p>
          </CardContent>
        </Card>

        <Card className="bg-card/75 border-border/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">CAN-Bus Fuel Health</span>
            <Fuel className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">-28.4%</div>
            <p className="text-[11px] text-sky-500 font-semibold mt-0.5">Zero siphon theft alerts</p>
          </CardContent>
        </Card>

        <Card className="bg-card/75 border-border/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">WhatsApp Alerts Sent</span>
            <MessageSquare className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">1,842</div>
            <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">KonnectX Cloud Hook Live</p>
          </CardContent>
        </Card>
      </div>

      {/* Dispatches Management Hub */}
      <Card className="border-border/60 bg-card/70">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Active Highway Dispatches & Freight Manifests</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Track live vehicle positions, CAN-bus speed, fuel consumption, and customer tracking status.
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search rig, driver, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-background/80"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
            <TabsList className="bg-muted/50 p-0.5 h-8">
              <TabsTrigger value="all" className="text-xs px-3">All ({dispatches.length})</TabsTrigger>
              <TabsTrigger value="transit" className="text-xs px-3">In Transit</TabsTrigger>
              <TabsTrigger value="arrived" className="text-xs px-3">Arrived</TabsTrigger>
              <TabsTrigger value="alert" className="text-xs px-3">Geofence Check</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-5 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-3">Dispatch ID</th>
                  <th className="py-3 px-3">Vehicle & Driver</th>
                  <th className="py-3 px-3">Route Corridor</th>
                  <th className="py-3 px-3">ETA & Speed</th>
                  <th className="py-3 px-3">Fuel CAN-Bus</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Customer Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredDispatches.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-sky-500">{d.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">{d.rig}</div>
                      <div className="text-[11px] text-muted-foreground">{d.driver}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-foreground">{d.origin}</div>
                      <div className="text-[11px] text-sky-500">➔ {d.destination}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">{d.eta}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {d.speed}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {d.fuelStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          d.status === "Arrived"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : d.status === "Geofence Check"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-sky-500/10 text-sky-500 border-sky-500/20"
                        }`}
                      >
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {d.whatsappNotified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Pinged
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerWhatsAppAlert(d.id, d.driver)}
                          className="h-7 text-[11px] px-2.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
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
