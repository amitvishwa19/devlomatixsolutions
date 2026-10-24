'use client';

import React, { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    MapPin,
    Navigation,
    User,
    Car,
    Footprints,
    Smartphone,
    Laptop,
    Battery,
    Gauge,
    RefreshCw,
    Compass,
    Calendar,
    ChevronLeft,
    Clock,
    Activity,
    Layers,
    ShieldCheck,
    Radio,
    Maximize2,
    CheckCircle2,
    Filter,
    Users,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';

import GoogleTeamMapView from './_components/GoogleTeamMapView';
import { getTeamLocationsAction, clearUserTrailAction } from '../_actions/location-actions';

export default function CrmTeamLocationPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [isPending, startTransition] = useTransition();
    const [teamData, setTeamData] = useState({
        teamMembers: [],
        totalUsers: 0,
        stats: {
            totalUsers: 0,
            onlineCount: 0,
            drivingCount: 0,
            walkingCount: 0,
            stationaryCount: 0,
            mobileCount: 0,
            webCount: 0,
            totalDistanceKm: '0.00',
        },
    });

    const [selectedUserId, setSelectedUserId] = useState('all');
    const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(30); // seconds (0 = paused)
    const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());
    const [countdown, setCountdown] = useState(30);
    const [showTrails, setShowTrails] = useState(true);

    const mapRef = useRef(null);

    // ─── Fetch Team Locations via Server Action ──────────────────────────────
    const fetchLocations = useCallback(async (targetDate = dateStr, silent = false) => {
        try {
            const res = await getTeamLocationsAction(workspaceId, targetDate);
            if (res.success) {
                setTeamData(res);
                setLastRefreshedAt(new Date());
                if (!silent) {
                    toast.success('Team GPS telemetry updated', { id: 'loc-refresh', duration: 1500 });
                }
            } else {
                toast.error(res.error || 'Failed to fetch team locations');
            }
        } catch (err) {
            console.error('[FETCH_LOCATIONS_ERROR]', err);
            toast.error('Network error updating telemetry');
        }
    }, [workspaceId, dateStr]);

    // Initial fetch
    useEffect(() => {
        startTransition(() => {
            fetchLocations(dateStr, true);
        });
    }, [fetchLocations, dateStr]);

    // ─── Auto-Refresh Loop ───────────────────────────────────────────────────
    useEffect(() => {
        if (!autoRefreshInterval || autoRefreshInterval <= 0) return;

        setCountdown(autoRefreshInterval);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    fetchLocations(dateStr, true);
                    return autoRefreshInterval;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [autoRefreshInterval, dateStr, fetchLocations]);

    // ─── Selected User Object ────────────────────────────────────────────────
    const selectedUser = teamData.teamMembers.find((u) => u.id === selectedUserId);

    // ─── Handle Select User ──────────────────────────────────────────────────
    const handleSelectUser = (userId) => {
        setSelectedUserId(userId);
        if (userId === 'all') {
            mapRef.current?.fitAllUsers();
        } else {
            mapRef.current?.centerOnUser(userId);
        }
    };

    // ─── Handle Clear User Trail ─────────────────────────────────────────────
    const handleClearTrail = async (userId) => {
        if (!confirm('Are you sure you want to clear this user’s location trail for today?')) return;
        try {
            const res = await clearUserTrailAction(workspaceId, userId, dateStr);
            if (res.success) {
                toast.success('Trail cleared');
                fetchLocations(dateStr, true);
            } else {
                toast.error(res.error || 'Failed to clear trail');
            }
        } catch (e) {
            toast.error('Failed to clear trail');
        }
    };

    return (
        <div className="flex flex-col w-full h-[calc(100vh-4rem)] p-3 space-y-3 overflow-hidden bg-background">
            {/* Top Navigation & Controls Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card border border-border/80 px-4 py-3 rounded-2xl shadow-xs shrink-0">
                <div className="flex items-center gap-3">
                    <Link href={`/workspace/${workspaceId}/crm`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Field Team Telemetry & Live Map
                            </h2>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-semibold text-emerald-600 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live GPS
                            </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Real-time Google Maps telemetry, walking/driving indicators, and device sessions across mobile & web.
                        </p>
                    </div>
                </div>

                {/* Header Action Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Date Picker Input */}
                    <div className="flex items-center gap-1.5 bg-muted/60 border border-border px-2 py-1 rounded-lg text-xs">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            type="date"
                            value={dateStr}
                            onChange={(e) => {
                                setDateStr(e.target.value);
                                fetchLocations(e.target.value);
                            }}
                            className="bg-transparent border-none text-xs text-foreground focus:outline-none cursor-pointer"
                        />
                    </div>

                    {/* Auto-Refresh Toggle Selector */}
                    <div className="flex items-center gap-1 bg-muted/60 border border-border px-2 py-1 rounded-lg text-xs">
                        <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                        <select
                            value={autoRefreshInterval}
                            onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                            className="bg-transparent border-none text-xs text-foreground focus:outline-none cursor-pointer"
                        >
                            <option value={15}>15s sync</option>
                            <option value={30}>30s sync</option>
                            <option value={60}>60s sync</option>
                            <option value={0}>Manual only</option>
                        </select>
                        {autoRefreshInterval > 0 && (
                            <span className="text-[10px] text-muted-foreground font-mono ml-1">
                                ({countdown}s)
                            </span>
                        )}
                    </div>

                    {/* Manual Refresh Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold gap-1.5 shadow-2xs"
                        onClick={() => fetchLocations(dateStr)}
                        disabled={isPending}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>

                    {/* Fit All Map Button */}
                    <Button
                        variant="default"
                        size="sm"
                        className="h-8 text-xs font-semibold gap-1.5 shadow-2xs"
                        onClick={() => handleSelectUser('all')}
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>View All Team</span>
                    </Button>
                </div>
            </div>

            {/* KPI Telemetry Stat Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
                <Card className="p-2.5 bg-card/60 backdrop-blur border-border shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Team On Duty</p>
                            <div className="text-lg font-bold text-foreground mt-0.5">
                                {teamData.stats.onlineCount} <span className="text-xs font-medium text-muted-foreground">/ {teamData.stats.totalUsers}</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2.5 bg-card/60 backdrop-blur border-border shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Activity Breakdown</p>
                            <div className="text-xs font-bold text-foreground mt-1 flex items-center gap-2">
                                <span className="flex items-center gap-1 text-emerald-600">
                                    <Car className="w-3 h-3" /> {teamData.stats.drivingCount} drive
                                </span>
                                <span className="flex items-center gap-1 text-indigo-600">
                                    <Footprints className="w-3 h-3" /> {teamData.stats.walkingCount} walk
                                </span>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <Activity className="w-4 h-4" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2.5 bg-card/60 backdrop-blur border-border shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Platform Sessions</p>
                            <div className="text-xs font-bold text-foreground mt-1 flex items-center gap-2">
                                <span className="flex items-center gap-1 text-purple-600">
                                    <Smartphone className="w-3 h-3" /> {teamData.stats.mobileCount} Mobile
                                </span>
                                <span className="flex items-center gap-1 text-blue-600">
                                    <Laptop className="w-3 h-3" /> {teamData.stats.webCount} Web
                                </span>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2.5 bg-card/60 backdrop-blur border-border shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Distance Covered</p>
                            <div className="text-lg font-bold text-foreground mt-0.5">
                                {teamData.stats.totalDistanceKm} <span className="text-xs font-medium text-muted-foreground">km</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <Gauge className="w-4 h-4" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Interactive Split Work Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
                {/* Left Panel: Team Members List (4 cols) */}
                <div className="lg:col-span-4 flex flex-col h-full bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-3 border-b border-border flex items-center justify-between shrink-0 bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-bold text-foreground">Organization Field Reps</h3>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-semibold">
                            {teamData.totalUsers} Active Members
                        </Badge>
                    </div>

                    {/* "All Team" Master Filter Card */}
                    <div className="p-2 shrink-0 border-b border-border/50 bg-background/50">
                        <button
                            type="button"
                            onClick={() => handleSelectUser('all')}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                                selectedUserId === 'all'
                                    ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                                    : 'hover:bg-muted/60 text-foreground'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedUserId === 'all' ? 'bg-primary-foreground/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                    <Layers className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold">All Team Members</p>
                                    <p className={`text-[10px] ${selectedUserId === 'all' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                        Show all 4 rep positions & trails simultaneously
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/10">
                                {teamData.totalUsers}
                            </span>
                        </button>
                    </div>

                    {/* Reps Scroll List */}
                    <ScrollArea className="flex-1 p-2">
                        <div className="space-y-1.5">
                            {teamData.teamMembers.map((user) => {
                                const isSelected = selectedUserId === user.id;
                                const isDriving = user.isDriving;
                                const isWalking = user.activity === 'walking';

                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => handleSelectUser(user.id)}
                                        className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-primary/10 border-primary shadow-xs'
                                                : 'bg-card/70 border-border/70 hover:bg-muted/40 hover:border-border'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            {/* Avatar with Status Pulse */}
                                            <div className="relative shrink-0 mt-0.5">
                                                <Avatar className="w-9 h-9 border-2" style={{ borderColor: user.color }}>
                                                    {user.avatar ? (
                                                        <AvatarImage src={user.avatar} alt={user.name} />
                                                    ) : (
                                                        <AvatarFallback style={{ backgroundColor: `${user.color}20`, color: user.color }} className="font-bold text-xs">
                                                            {user.name.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                {user.isOnline && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                                                )}
                                            </div>

                                            {/* Rep Dossier Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <h4 className="text-xs font-bold text-foreground truncate">{user.name}</h4>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[9px] px-1 py-0 font-medium shrink-0"
                                                        style={{ borderColor: `${user.color}40`, color: user.color }}
                                                    >
                                                        {user.role}
                                                    </Badge>
                                                </div>

                                                {/* Email & Device Row */}
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                                                    <span className="truncate max-w-[140px] font-mono">{user.email}</span>
                                                    <span className="text-border">•</span>
                                                    <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-muted font-medium text-[9px]">
                                                        {user.platform === 'mobile' ? (
                                                            <>
                                                                <Smartphone className="w-2.5 h-2.5 text-purple-500" />
                                                                <span>Mobile</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Laptop className="w-2.5 h-2.5 text-blue-500" />
                                                                <span>Web</span>
                                                            </>
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Telemetry Metrics Row */}
                                                <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-border/50 text-[10px]">
                                                    <div className="flex items-center gap-1">
                                                        {isDriving ? (
                                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                                                <Car className="w-3 h-3" /> Driving ({user.speedKmH} km/h)
                                                            </span>
                                                        ) : isWalking ? (
                                                            <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                                                                <Footprints className="w-3 h-3" /> Walking ({user.speedKmH} km/h)
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                                <Clock className="w-3 h-3" /> Stationary
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-muted-foreground font-semibold">
                                                        {user.distanceKm} km
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Panel: Google Map with Floating Dossier (8 cols) */}
                <div className="lg:col-span-8 flex flex-col h-full relative rounded-2xl overflow-hidden border border-border shadow-xs">
                    <GoogleTeamMapView
                        ref={mapRef}
                        teamMembers={teamData.teamMembers}
                        selectedUserId={selectedUserId}
                        onSelectUser={handleSelectUser}
                        showTrails={showTrails}
                        className="w-full h-full"
                    />

                    {/* Bottom Floating Telemetry Dossier Bar (if a single user is selected) */}
                    {selectedUser && (
                        <div className="absolute bottom-3 left-3 right-3 z-20 bg-background/95 backdrop-blur-md border border-border p-3 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="w-10 h-10 border-2" style={{ borderColor: selectedUser.color }}>
                                    {selectedUser.avatar ? (
                                        <AvatarImage src={selectedUser.avatar} />
                                    ) : (
                                        <AvatarFallback style={{ backgroundColor: `${selectedUser.color}20`, color: selectedUser.color }} className="font-bold text-xs">
                                            {selectedUser.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    )}
                                </Avatar>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-bold text-foreground truncate">{selectedUser.name}</h4>
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium" style={{ borderColor: selectedUser.color, color: selectedUser.color }}>
                                            {selectedUser.role}
                                        </Badge>
                                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                            {selectedUser.platform === 'mobile' ? '📱 Mobile App' : '💻 Web Browser'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                                        <span>✉️ {selectedUser.email}</span>
                                        {selectedUser.ip && <span>🌐 IP: {selectedUser.ip}</span>}
                                        {selectedUser.device && <span>📱 {selectedUser.device}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
                                <div className="text-right pr-2">
                                    <div className="text-xs font-bold text-foreground">
                                        {selectedUser.speedKmH} km/h • {selectedUser.distanceKm} km
                                    </div>
                                    <div className="text-[9px] text-muted-foreground">
                                        {selectedUser.trail?.length || 0} GPS breadcrumbs today
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs font-semibold"
                                    onClick={() => handleClearTrail(selectedUser.id)}
                                >
                                    Clear Trail
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-7 text-xs font-semibold"
                                    onClick={() => handleSelectUser('all')}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
