'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, FileText, DollarSign, AlertTriangle, BarChart3, Settings as SettingsIcon, Pill, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// UI components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileText as FileTextIcon, TrendingUp, Building2, Bell, Shield, Database, ShoppingCart, CreditCard, Receipt } from 'lucide-react';
import { StatCard } from '../_components/StatCard';
import { MedicineTable } from '../_components/MedicineTable';
import { PrescriptionCard } from '../_components/PrescriptionCard';
import { LowStockAlert } from '../_components/LowStockAlert';
import { categoryChartData, dashboardStats, mockMedicines, mockPrescriptions, mockSales, salesChartData, trendChartData } from '../_data/mockData';
import { QuickBillDialog } from '../_components/QuickBillDialog';
import { CreateBillDialog } from '../_components/CreateBillDialog';

const views = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'sales', label: 'Sales', icon: DollarSign },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    // { id: 'reports', label: 'Reports', icon: BarChart3 },
    // { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function PharmacyManagement() {
    const [activeView, setActiveView] = useState('dashboard');
    const [medicines, setMedicines] = useState(mockMedicines);
    const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
    const [billDialogOpen, setBillDialogOpen] = useState(false);
    const [quickBillDialogOpen, setQuickBillDialogOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    // Medicine handlers
    const handleAddMedicine = (medicine) => {
        const newMedicine = {
            ...medicine,
            id: String(Date.now()),
            status: medicine.quantity > medicine.reorderLevel ? 'in-stock' :
                medicine.quantity === 0 ? 'out-of-stock' : 'low-stock',
        };
        setMedicines((prev) => [...prev, newMedicine]);
    };

    const handleDeleteMedicine = (id) => {
        setMedicines((prev) => prev.filter((m) => m.id !== id));
        toast({
            title: 'Medicine Deleted',
            description: 'The medicine has been removed from inventory.',
        });
    };

    const handleEditMedicine = (medicine) => {
        toast({
            title: 'Edit Medicine',
            description: `Editing ${medicine.name}`,
        });
    };

    // Prescription handlers
    const handleDispense = (id) => {
        setPrescriptions((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: 'dispensed' } : p))
        );
        toast({
            title: 'Prescription Dispensed',
            description: `Prescription ${id} has been marked as dispensed.`,
        });
    };

    const handleCancel = (id) => {
        setPrescriptions((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: 'cancelled' } : p))
        );
        toast({
            title: 'Prescription Cancelled',
            description: `Prescription ${id} has been cancelled.`,
        });
    };

    const handleCreateBill = (prescription) => {
        setSelectedPrescription(prescription);
        setBillDialogOpen(true);
    };

    const pendingPrescriptions = prescriptions.filter((p) => p.status === 'pending');
    const dispensedPrescriptions = prescriptions.filter((p) => p.status === 'dispensed');
    const cancelledPrescriptions = prescriptions.filter((p) => p.status === 'cancelled');

    const lowStock = medicines.filter(m => m.status === 'low-stock' || m.status === 'out-of-stock');
    const expiringMedicines = medicines.filter(m => {
        const expiry = new Date(m.expiryDate);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return expiry <= threeMonthsFromNow;
    });

    const totalSales = mockSales.reduce((sum, sale) => sum + sale.total, 0);
    const cashSales = mockSales.filter(s => s.payment === 'cash').reduce((sum, sale) => sum + sale.total, 0);
    const cardSales = mockSales.filter(s => s.payment === 'card').reduce((sum, sale) => sum + sale.total, 0);

    const getSubtitle = () => {
        switch (activeView) {
            case 'dashboard': return "Welcome back! Here's your pharmacy overview.";
            case 'inventory': return 'Manage your pharmacy stock and supplies';
            case 'prescriptions': return 'Manage patient prescriptions and dispensing';
            case 'sales': return 'Track your daily sales and transactions';
            case 'alerts': return 'Stock and expiry alerts for your pharmacy';
            case 'reports': return 'Insights and performance metrics';
            case 'settings': return 'Manage your pharmacy system preferences';
            default: return '';
        }
    };

    return (
        <div className="flex-1 flex flex-col gap-2">


            {/* View Selector Button Group */}
            <div className="p-4 border rounded-lg bg-card hover:border-primary/30">
                <div className="flex flex-wrap items-center gap-2">
                    {views.map((view) => {
                        const Icon = view.icon;
                        return (
                            <Button
                                key={view.id}
                                variant={activeView === view.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveView(view.id)}
                                className={cn(
                                    'gap-2 transition-all',
                                    activeView === view.id && 'shadow-lg shadow-primary/20'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {view.label}
                            </Button>
                        );
                    })}

                </div>
            </div>

            <main className="flex-1 overflow-y-auto">

                {/* Dashboard View */}
                {activeView === 'dashboard' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            <StatCard title="Total Medicines" value={dashboardStats.totalMedicines} icon={Pill} subtitle="In inventory" />
                            <StatCard title="Low Stock" value={dashboardStats.lowStockCount} icon={AlertTriangle} variant="warning" subtitle="Need reorder" />
                            <StatCard title="Out of Stock" value={dashboardStats.outOfStockCount} icon={Package} variant="destructive" subtitle="Urgent" />
                            <StatCard title="Today's Sales" value={`₹${dashboardStats.todaySales.toFixed(2)}`} icon={DollarSign} variant="success" trend={{ value: 12, isPositive: true }} />
                            <StatCard title="Pending Rx" value={dashboardStats.pendingPrescriptions} icon={FileText} subtitle="To dispense" />
                            <StatCard title="Expiring Soon" value={dashboardStats.expiringThisMonth} icon={Calendar} variant="warning" subtitle="This month" />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2 space-y-4">
                                <h2 className="text-lg font-semibold text-foreground">Medicine Inventory</h2>
                                <MedicineTable medicines={medicines} onAdd={handleAddMedicine} />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold text-foreground">Pending Prescriptions</h2>
                                    {pendingPrescriptions.length > 0 ? (
                                        pendingPrescriptions.map((prescription) => (
                                            <PrescriptionCard key={prescription.id} prescription={prescription} onDispense={handleDispense} onCreateBill={handleCreateBill} />
                                        ))
                                    ) : (
                                        <div className="stat-card">
                                            <div className="relative z-10 text-center py-4">
                                                <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">No pending prescriptions</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold text-foreground">Stock Alerts</h2>
                                    <LowStockAlert medicines={medicines} onReorder={(medicine) => toast({ title: 'Reorder Initiated', description: `Reorder request sent for ${medicine.name}` })} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Inventory View */}
                {activeView === 'inventory' && (
                    <div className="animate-fade-in">
                        <MedicineTable medicines={medicines} onAdd={handleAddMedicine} onDelete={handleDeleteMedicine} onEdit={handleEditMedicine} />
                    </div>
                )}

                {/* Prescriptions View */}
                {activeView === 'prescriptions' && (
                    <div className="animate-fade-in">
                        <Tabs defaultValue="pending" className="space-y-6">
                            <TabsList className="bg-secondary/50">
                                <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pending ({pendingPrescriptions.length})</TabsTrigger>
                                <TabsTrigger value="dispensed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dispensed ({dispensedPrescriptions.length})</TabsTrigger>
                                <TabsTrigger value="cancelled" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Cancelled ({cancelledPrescriptions.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="pending" className="space-y-4">
                                {pendingPrescriptions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {pendingPrescriptions.map((prescription) => (
                                            <PrescriptionCard key={prescription.id} prescription={prescription} onDispense={handleDispense} onCancel={handleCancel} onCreateBill={handleCreateBill} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="stat-card text-center py-12"><p className="text-muted-foreground">No pending prescriptions</p></div>
                                )}
                            </TabsContent>

                            <TabsContent value="dispensed" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dispensedPrescriptions.map((prescription) => (
                                        <PrescriptionCard key={prescription.id} prescription={prescription} onCreateBill={handleCreateBill} />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="cancelled" className="space-y-4">
                                {cancelledPrescriptions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {cancelledPrescriptions.map((prescription) => (
                                            <PrescriptionCard key={prescription.id} prescription={prescription} onCreateBill={handleCreateBill} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="stat-card text-center py-12"><p className="text-muted-foreground">No cancelled prescriptions</p></div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {/* Sales View */}
                {activeView === 'sales' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* New Bill Button */}
                        <div className="flex justify-end">
                            <Button onClick={() => setQuickBillDialogOpen(true)} className="gap-2">
                                <Receipt className="w-4 h-4" />
                                New Bill
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Today's Sales" value={`₹${totalSales.toFixed(2)}`} icon={DollarSign} variant="success" trend={{ value: 12, isPositive: true }} />
                            <StatCard title="Transactions" value={mockSales.length} icon={ShoppingCart} subtitle="Today" />
                            <StatCard title="Cash Sales" value={`₹${cashSales.toFixed(2)}`} icon={TrendingUp} subtitle="Today" />
                            <StatCard title="Card Sales" value={`₹${cardSales.toFixed(2)}`} icon={CreditCard} subtitle="Today" />
                        </div>

                        <div className="table-container">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border hover:bg-transparent">
                                        <TableHead className="text-muted-foreground">ID</TableHead>
                                        <TableHead className="text-muted-foreground">Date & Time</TableHead>
                                        <TableHead className="text-muted-foreground">Customer</TableHead>
                                        <TableHead className="text-muted-foreground">Items</TableHead>
                                        <TableHead className="text-muted-foreground">Payment</TableHead>
                                        <TableHead className="text-muted-foreground text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockSales.map((sale, index) => (
                                        <TableRow key={sale.id} className="border-border hover:bg-secondary/30 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                            <TableCell className="font-mono text-foreground">{sale.id}</TableCell>
                                            <TableCell className="text-muted-foreground">{sale.date}</TableCell>
                                            <TableCell className="text-foreground">{sale.customer}</TableCell>
                                            <TableCell className="text-muted-foreground">{sale.items} items</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={sale.payment === 'cash' ? 'badge-success border' : sale.payment === 'card' ? 'bg-primary/10 text-primary border-primary/20' : 'badge-warning border'}>
                                                    {sale.payment}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-foreground">₹{sale.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Alerts View */}
                {activeView === 'alerts' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="stat-card">
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-warning/10"><AlertTriangle className="w-6 h-6 text-warning" /></div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{lowStock.length}</p>
                                        <p className="text-sm text-muted-foreground">Low/Out of Stock Items</p>
                                    </div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-destructive/10"><Calendar className="w-6 h-6 text-destructive" /></div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{expiringMedicines.length}</p>
                                        <p className="text-sm text-muted-foreground">Expiring Soon</p>
                                    </div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10"><Package className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{medicines.filter(m => m.status === 'in-stock').length}</p>
                                        <p className="text-sm text-muted-foreground">In Stock Items</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" />Stock Alerts</h2>
                            <LowStockAlert medicines={medicines} onReorder={(medicine) => toast({ title: 'Reorder Initiated', description: `Reorder request sent for ${medicine.name}` })} />
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Calendar className="w-5 h-5 text-destructive" />Expiring Soon</h2>
                            <div className="space-y-3">
                                {expiringMedicines.map((medicine, index) => (
                                    <div key={medicine.id} className="stat-card border-destructive/20 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-lg bg-destructive/10"><Calendar className="w-5 h-5 text-destructive" /></div>
                                                <div>
                                                    <h3 className="font-medium text-foreground">{medicine.name}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-sm text-muted-foreground">Batch: <span className="font-mono">{medicine.batchNumber}</span></span>
                                                        <span className="text-muted-foreground">•</span>
                                                        <span className="text-sm text-muted-foreground">Qty: {medicine.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge className="badge-destructive border">Expires: {medicine.expiryDate}</Badge>
                                                <Button size="sm" variant="outline">Mark for Return</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* Reports View */}
                {activeView === 'reports' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex gap-4 flex-wrap">
                            <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />Export Sales Report</Button>
                            <Button variant="outline" className="gap-2"><FileTextIcon className="w-4 h-4" />Inventory Report</Button>
                            <Button variant="outline" className="gap-2"><TrendingUp className="w-4 h-4" />Financial Summary</Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-card border-border">
                                <CardHeader><CardTitle className="text-foreground">Weekly Sales</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={salesChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                                                <XAxis dataKey="name" stroke="hsl(215, 20%, 65%)" />
                                                <YAxis stroke="hsl(215, 20%, 65%)" />
                                                <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 14%)', border: '1px solid hsl(217, 33%, 22%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                                                <Bar dataKey="sales" fill="hsl(174, 72%, 46%)" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border">
                                <CardHeader><CardTitle className="text-foreground">Sales by Category</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="h-[300px] flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                                    {categoryChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 14%)', border: '1px solid hsl(217, 33%, 22%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                                        {categoryChartData.map((cat) => (
                                            <div key={cat.name} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                                <span className="text-sm text-muted-foreground">{cat.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border lg:col-span-2">
                                <CardHeader><CardTitle className="text-foreground">Revenue Trend (6 Months)</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={trendChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
                                                <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" />
                                                <YAxis stroke="hsl(215, 20%, 65%)" />
                                                <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 14%)', border: '1px solid hsl(217, 33%, 22%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} formatter={(value) => [`₹${value}`, 'Revenue']} />
                                                <Line type="monotone" dataKey="revenue" stroke="hsl(174, 72%, 46%)" strokeWidth={3} dot={{ fill: 'hsl(174, 72%, 46%)', strokeWidth: 2 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Settings View */}
                {activeView === 'settings' && (
                    <div className="max-w-3xl space-y-6 animate-fade-in">
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10"><Building2 className="w-5 h-5 text-primary" /></div>
                                    <div><CardTitle className="text-foreground">Pharmacy Information</CardTitle><CardDescription>Basic details about your pharmacy</CardDescription></div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor="pharmacyName">Pharmacy Name</Label><Input id="pharmacyName" defaultValue="PharmaCare" className="bg-secondary/50 border-border" /></div>
                                    <div className="space-y-2"><Label htmlFor="licenseNo">License Number</Label><Input id="licenseNo" defaultValue="PH-2024-1234" className="bg-secondary/50 border-border" /></div>
                                </div>
                                <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" defaultValue="123 Medical Center Drive, Healthcare City" className="bg-secondary/50 border-border" /></div>
                                <Button>Save Changes</Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10"><Bell className="w-5 h-5 text-primary" /></div>
                                    <div><CardTitle className="text-foreground">Notifications</CardTitle><CardDescription>Configure alert preferences</CardDescription></div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div><p className="font-medium text-foreground">Low Stock Alerts</p><p className="text-sm text-muted-foreground">Get notified when items fall below reorder level</p></div>
                                    <Switch defaultChecked />
                                </div>
                                <Separator className="bg-border" />
                                <div className="flex items-center justify-between">
                                    <div><p className="font-medium text-foreground">Expiry Alerts</p><p className="text-sm text-muted-foreground">Notifications for medicines expiring within 3 months</p></div>
                                    <Switch defaultChecked />
                                </div>
                                <Separator className="bg-border" />
                                <div className="flex items-center justify-between">
                                    <div><p className="font-medium text-foreground">New Prescription Alerts</p><p className="text-sm text-muted-foreground">Get notified when new prescriptions arrive</p></div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10"><Shield className="w-5 h-5 text-primary" /></div>
                                    <div><CardTitle className="text-foreground">Security</CardTitle><CardDescription>Manage security settings</CardDescription></div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div><p className="font-medium text-foreground">Two-Factor Authentication</p><p className="text-sm text-muted-foreground">Add an extra layer of security</p></div>
                                    <Switch />
                                </div>
                                <Separator className="bg-border" />
                                <div className="flex items-center justify-between">
                                    <div><p className="font-medium text-foreground">Session Timeout</p><p className="text-sm text-muted-foreground">Auto-logout after 30 minutes of inactivity</p></div>
                                    <Switch defaultChecked />
                                </div>
                                <Button variant="outline">Change Password</Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10"><Database className="w-5 h-5 text-primary" /></div>
                                    <div><CardTitle className="text-foreground">Data Management</CardTitle><CardDescription>Backup and export options</CardDescription></div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-4"><Button variant="outline">Export Data</Button><Button variant="outline">Create Backup</Button></div>
                                <p className="text-sm text-muted-foreground">Last backup: January 1, 2026 at 11:30 PM</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>

            {selectedPrescription && (
                <CreateBillDialog prescription={selectedPrescription} open={billDialogOpen} onOpenChange={setBillDialogOpen} />
            )}


        </div>
    );
}
