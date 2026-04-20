'use client'
import React, { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { mockCategories, mockDispensing, mockInventory, mockPurchaseOrders, mockSalesData, mockSuppliers } from './utils/mockData';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getInventory } from '../inventory/_action/get-inventory';
import { manageInventory } from '../inventory/_action/manage-inventory';
import { useAction } from '@/hooks/use-action';
import { Loader } from 'lucide-react';
import { BarcodeScanner, BatchExpiryTracker, DispensingPanel, DrugInteractionChecker, InventoryTable, PharmacyAnalytics, PurchaseOrders, ReturnAdjustmentManager, SupplierManagement } from './components';


const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];


export default function PharmacyPage() {
    const { orgId } = useParams();
    const queryClient = useQueryClient();

    const { data: medicinesData, isLoading } = useQuery({
        queryKey: ['inventory', orgId],
        queryFn: async () => {
            const response = await getInventory({ serverId: orgId });
            return response.data?.items || [];
        }
    });

    const inventory = medicinesData || [];
    const [dispensing, setDispensing] = React.useState([]); // Dispensing records should also come from DB
    const [suppliers] = React.useState(mockSuppliers);
    const [purchaseOrders, setPurchaseOrders] = React.useState(mockPurchaseOrders);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('all');
    const [activeTab, setActiveTab] = React.useState('overview');
    const [showAddMedicine, setShowAddMedicine] = React.useState(false);
    const [showDispense, setShowDispense] = React.useState(false);

    // Calculate stats
    const stats = React.useMemo(() => {
        const lowStock = inventory.filter((i) => i.quantity <= i.reorderLevel);
        const expiringSoon = inventory.filter((i) => {
            const days = differenceInDays(new Date(i.expiryDate), new Date());
            return days <= 30 && days > 0;
        });
        const expired = inventory.filter((i) => differenceInDays(new Date(i.expiryDate), new Date()) <= 0);
        const todayDispensed = dispensing.filter((d) => {
            const today = new Date().toDateString();
            return new Date(d.dispensedAt).toDateString() === today;
        });
        const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);
        const pendingOrders = purchaseOrders.filter(o => o.status !== 'delivered').length;

        return {
            totalItems: inventory.length,
            totalStock: inventory.reduce((sum, i) => sum + i.quantity, 0),
            lowStock: lowStock.length,
            expiringSoon: expiringSoon.length,
            expired: expired.length,
            todayDispensed: todayDispensed.length,
            totalValue,
            pendingOrders,
            lowStockItems: lowStock,
            expiringItems: expiringSoon,
        };
    }, [inventory, dispensing, purchaseOrders]);

    // Category distribution for pie chart
    const categoryData = React.useMemo(() => {
        const categories = {};
        inventory.forEach(item => {
            categories[item.category] = (categories[item.category] || 0) + item.quantity;
        });
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [inventory]);

    // Sales trend data
    const salesTrend = React.useMemo(() => {
        return mockSalesData.map(d => ({
            date: format(d.date, 'EEE'),
            revenue: d.revenue,
            items: d.items,
        }));
    }, []);

    const { execute: executeManage } = useAction(manageInventory, {
        onSuccess: () => queryClient.invalidateQueries(['inventory', orgId])
    });

    const handleDispense = (dispenseData) => {
        executeManage({
            id: dispenseData.medicineId,
            serverId: orgId,
            type: "STOCK_ADJUSTMENT",
            adjustment: {
                type: "DISPENSE",
                quantity: dispenseData.quantity,
                notes: `Dispensed to ${dispenseData.patientName}`,
                performedBy: "Pharmacist",
            }
        });
        setShowDispense(false);
    };

    const handleAddMedicine = (medicine) => {
        executeManage({
            serverId: orgId,
            type: "UPSERT",
            itemData: medicine,
        });
        setShowAddMedicine(false);
    };


    return (

        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Pharmacy Management'
                description='Bringing technology and healthcare together to simplify pharmacy workflows and elevate patient safety'
                icon='tablets'
                actionComp={<div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowDispense(true)}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Dispense
                    </Button>
                    <Button onClick={() => setShowAddMedicine(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medicine
                    </Button>
                </div>}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <StatCard icon={Package} label="Total Items" value={stats.totalItems} />
                <StatCard icon={Pill} label="Total Stock" value={stats.totalStock.toLocaleString()} />
                <StatCard icon={TrendingDown} label="Low Stock" value={stats.lowStock} variant="warning" />
                <StatCard icon={AlertTriangle} label="Expiring Soon" value={stats.expiringSoon} variant="warning" />
                <StatCard icon={XCircle} label="Expired" value={stats.expired} variant="danger" />
                <StatCard icon={CheckCircle} label="Dispensed Today" value={stats.todayDispensed} variant="success" />
                <StatCard icon={Truck} label="Pending Orders" value={stats.pendingOrders} />
                <StatCard icon={BarChart3} label="Stock Value" value={`₹${(stats.totalValue / 1000).toFixed(1)}K`} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="dispensing">Dispensing</TabsTrigger>
                    <TabsTrigger value="batches">Batch & Expiry</TabsTrigger>
                    <TabsTrigger value="scanner">Barcode Scanner</TabsTrigger>
                    <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
                    <TabsTrigger value="returns">Returns & Adjustments</TabsTrigger>
                    <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
                    <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>


            <ScrollArea className='h-[65vh] flex flex-grow rounded-md'>
                {isLoading ? (
                    <div className='flex items-center justify-center h-[200px]'>
                        <Loader className='animate-spin text-muted-foreground' />
                    </div>
                ) : (
                    <>
                        {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Sales Trend Chart */}
                            <Card className="lg:col-span-2">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Weekly Sales Trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={salesTrend}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="date" className="text-xs" />
                                                <YAxis className="text-xs" />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Category Distribution */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Stock by Category</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={80}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {categoryData.slice(0, 4).map((cat, i) => (
                                            <div key={cat.name} className="flex items-center gap-1 text-xs">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <span className="text-muted-foreground">{cat.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Alerts Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Low Stock Alerts */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <TrendingDown className="w-4 h-4 text-amber-500" />
                                            Low Stock Alerts
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                            {stats.lowStock} items
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {stats.lowStockItems.slice(0, 5).map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.genericName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-amber-600">{item.quantity} left</p>
                                                <p className="text-xs text-muted-foreground">Reorder: {item.reorderLevel}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {stats.lowStock === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">No low stock alerts</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Expiry Alerts */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            Expiring Soon
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                            {stats.expiringSoon} items
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {stats.expiringItems.slice(0, 5).map(item => {
                                        const daysLeft = differenceInDays(new Date(item.expiryDate), new Date());
                                        return (
                                            <div key={item.id} className="flex items-center justify-between p-2 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">Batch: {item.batchNumber}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-red-600">{daysLeft} days</p>
                                                    <p className="text-xs text-muted-foreground">{format(new Date(item.expiryDate), 'dd MMM yyyy')}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {stats.expiringSoon === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">No expiry alerts</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Recent Dispensing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {dispensing.slice(0, 5).map(d => (
                                        <div key={d.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Pill className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{d.medicineName}</p>
                                                    <p className="text-xs text-muted-foreground">{d.patientName} • {d.quantity} units</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">{format(new Date(d.dispensedAt), 'dd MMM, HH:mm')}</p>
                                                <p className="text-xs text-muted-foreground">{d.dispensedBy}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Inventory Tab */}
                    <TabsContent value="inventory">
                        <InventoryTable
                            inventory={inventory}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            categoryFilter={categoryFilter}
                            setCategoryFilter={setCategoryFilter}
                            categories={mockCategories}
                            onEdit={(item) => console.log('Edit', item)}
                            onDelete={(id) => setInventory(prev => prev.filter(i => i.id !== id))}
                        />
                    </TabsContent>

                    {/* Dispensing Tab */}
                    <TabsContent value="dispensing">
                        <DispensingPanel
                            dispensing={dispensing}
                            inventory={inventory}
                            onDispense={() => setShowDispense(true)}
                        />
                    </TabsContent>

                    {/* Purchase Orders Tab */}
                    <TabsContent value="orders">
                        <PurchaseOrders
                            orders={purchaseOrders}
                            suppliers={suppliers}
                            onUpdateStatus={(orderId, status) => {
                                setPurchaseOrders(prev => prev.map(o =>
                                    o.id === orderId ? { ...o, status } : o
                                ));
                            }}
                        />
                    </TabsContent>

                    {/* Suppliers Tab */}
                    <TabsContent value="suppliers">
                        <SupplierManagement suppliers={suppliers} />
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics">
                        <PharmacyAnalytics
                            inventory={inventory}
                            dispensing={dispensing}
                            salesData={mockSalesData}
                        />
                    </TabsContent>

                    {/* Batch & Expiry Tab */}
                    <TabsContent value="batches">
                        <BatchExpiryTracker
                            inventory={inventory}
                            onUpdateInventory={setInventory}
                        />
                    </TabsContent>

                    {/* Barcode Scanner Tab */}
                    <TabsContent value="scanner">
                        <BarcodeScanner
                            inventory={inventory}
                            onDispense={(item) => {
                                console.log('Dispense from scanner:', item);
                                setShowDispense(true);
                            }}
                            onAddToCart={(item) => {
                                console.log('Add to cart:', item);
                            }}
                        />
                    </TabsContent>

                    {/* Drug Interactions Tab */}
                    <TabsContent value="interactions">
                        <DrugInteractionChecker
                            inventory={inventory}
                            patientAllergies={['Penicillin', 'Sulfa']}
                        />
                    </TabsContent>

                    {/* Returns & Adjustments Tab */}
                    <TabsContent value="returns">
                        <ReturnAdjustmentManager
                            inventory={inventory}
                            onUpdateInventory={setInventory}
                        />
                    </TabsContent>
                </>
                )}
            </ScrollArea>
            </Tabs>




        </div >
    )
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, variant = 'default' }) {
    const variants = {
        default: 'bg-muted/50',
        warning: 'bg-amber-50 dark:bg-amber-950/30',
        danger: 'bg-red-50 dark:bg-red-950/30',
        success: 'bg-emerald-50 dark:bg-emerald-950/30',
    };
    const iconVariants = {
        default: 'text-muted-foreground',
        warning: 'text-amber-600',
        danger: 'text-red-600',
        success: 'text-emerald-600',
    };

    return (
        <Card className={variants[variant]}>
            <CardContent className="p-3">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${iconVariants[variant]}`} />
                    <div>
                        <p className="text-lg font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

