"use client";

import React, { use, useState, useEffect, useCallback } from 'react';
import EcommerceHeader from "./_components/EcommerceHeader";
import EcommerceKpiCards from "./_components/EcommerceKpiCards";
import EcommerceFulfillmentPipeline from "./_components/EcommerceFulfillmentPipeline";
import EcommerceRevenueChart from "./_components/EcommerceRevenueChart";
import EcommerceLiveOrders from "./_components/EcommerceLiveOrders";
import EcommerceInventoryAlerts from "./_components/EcommerceInventoryAlerts";
import EcommerceCartRecovery from "./_components/EcommerceCartRecovery";
import EcommerceTopProducts from "./_components/EcommerceTopProducts";
import EcommerceStoreFleet from "./_components/EcommerceStoreFleet";
import EcommerceQuickNav from "./_components/EcommerceQuickNav";

export default function EcommercePage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState("all");
    const [period, setPeriod] = useState("30d");
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch Stores
    const fetchStores = useCallback(async () => {
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/stores`);
            const data = await res.json();
            if (data.success) {
                setStores(data.stores || []);
            }
        } catch (err) {
            console.error("Failed to load stores:", err);
        }
    }, [workspaceId]);

    // Fetch Aggregated Stats
    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/stats?storeId=${selectedStore}&period=${period}`);
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error("Failed to load ecommerce stats:", err);
        } finally {
            setLoadingStats(false);
        }
    }, [workspaceId, selectedStore, period]);

    useEffect(() => {
        if (workspaceId) {
            fetchStores();
        }
    }, [workspaceId, fetchStores]);

    useEffect(() => {
        if (workspaceId) {
            fetchStats();
        }
    }, [workspaceId, fetchStats]);

    // Manual Refresh Trigger
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                fetchStores(),
                fetchStats()
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-500 pb-12 p-4 max-w-[1700px] mx-auto w-full">
            {/* 1. Header with Multi-Store Switcher, Time Period & Quick CTAs */}
            <EcommerceHeader
                workspaceId={workspaceId}
                stores={stores}
                selectedStore={selectedStore}
                setSelectedStore={setSelectedStore}
                period={period}
                setPeriod={setPeriod}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
            />

            {/* 2. Executive KPI Ribbon (5 Telemetry Metrics) */}
            <EcommerceKpiCards
                stats={stats}
                loading={loadingStats}
            />

            {/* 3. Fulfillment Pipeline Stepper */}
            <EcommerceFulfillmentPipeline
                workspaceId={workspaceId}
                stats={stats}
            />

            {/* 4. Main 2-Column Operations Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Left 2-Column Area: Visual Analytics & Real-Time Orders Feed */}
                <div className="xl:col-span-2 space-y-5">
                    {/* Sales Velocity Recharts Chart */}
                    <EcommerceRevenueChart
                        workspaceId={workspaceId}
                        selectedStore={selectedStore}
                        period={period}
                    />

                    {/* Live Order Operations Stream */}
                    <EcommerceLiveOrders
                        workspaceId={workspaceId}
                        selectedStore={selectedStore}
                    />
                </div>

                {/* Right 1-Column Area: Recovery, Inventory, Top Merchandising & Store Fleets */}
                <div className="space-y-5">
                    {/* Abandoned Cart Recovery Terminal */}
                    <EcommerceCartRecovery
                        workspaceId={workspaceId}
                        selectedStore={selectedStore}
                        stats={stats}
                    />

                    {/* Inventory Depletion Radar */}
                    <EcommerceInventoryAlerts
                        workspaceId={workspaceId}
                        selectedStore={selectedStore}
                    />

                    {/* Merchandising Leaderboard */}
                    <EcommerceTopProducts
                        workspaceId={workspaceId}
                        selectedStore={selectedStore}
                    />

                    {/* Connected Store Fleets */}
                    <EcommerceStoreFleet
                        workspaceId={workspaceId}
                        stores={stores}
                    />
                </div>
            </div>

            {/* 5. Bottom Quick Navigation Dock to all 8 eCommerce Modules */}
            <div className="pt-2">
                <EcommerceQuickNav workspaceId={workspaceId} />
            </div>
        </div>
    );
}
