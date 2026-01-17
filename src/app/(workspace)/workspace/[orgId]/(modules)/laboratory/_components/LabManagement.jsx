import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { StatCard } from './StatCard';
import { OrdersTable } from './OrdersTable';
import { NewOrderDialog } from './NewOrderDialog';
import { EnhancedResultEntry } from './EnhancedResultEntry';
import { PrintableResult } from './PrintableResult';
import { TestCatalog } from './TestCatalog';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { SpecimenTrackingView } from './SpecimenTrackingView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    FlaskConical,
    ClipboardList,
    Clock,
    Activity,
    CheckCircle2,
    AlertTriangle,
    Plus,
    Search,
    Filter,
    Beaker,
    BarChart3,
    Package,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useLaboratory } from '../_hooks/useLaboratory';
import { calculateStats, initialLabOrders } from '../_data/mockLabData';
import { ContentTopbar } from '../../../(misc)/_components/ContentTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';


export function LabManagement() {
    const { orders: dbOrders, loading, createOrder, updateOrder, updateStatus } = useLaboratory();

    // Use DB orders if available, otherwise fallback to mock data
    const orders = dbOrders.length > 0 ? dbOrders : initialLabOrders;

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderToPrint, setOrderToPrint] = useState(null);

    const printRef = useRef(null);

    const stats = calculateStats(orders);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: orderToPrint ? `Lab_Report_${orderToPrint.orderId}` : 'Lab_Report',
        onAfterPrint: () => setOrderToPrint(null),
    });

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.tests.some(t => t.testName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleCreateOrder = async (orderData) => {
        try {
            await createOrder(orderData);
        } catch (err) {
            console.error('Failed to create order:', err);
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await updateStatus(orderId, status);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleUpdateOrder = async (orderId, updates) => {
        try {
            await updateOrder(orderId, updates);
        } catch (err) {
            console.error('Failed to update order:', err);
        }
    };

    const handlePrintResult = (order) => {
        setOrderToPrint(order);
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    return (



        <div className="relative">


            <Tabs defaultValue="orders" className="flex flex-col gap-2">

                <ContentTopbar
                    title='Laboratory Management'
                    description='Accelerate research, ensure reliability, and enhance care with technology'
                    icon='flask-conical'
                    action={false}
                    actionName='Quick Bill'
                    actionIcon='receipt-indian-rupee'
                    onActionClick={() => { setQuickBillDialogOpen(true) }}
                    actionComp={
                        <TabsList className="bg-muted/50 border border-border">


                            <TabsTrigger value="orders" className="gap-2">
                                <ClipboardList className="h-4 w-4" />
                                Orders
                            </TabsTrigger>
                            <TabsTrigger value="specimens" className="gap-2">
                                <Package className="h-4 w-4" />
                                Specimens
                            </TabsTrigger>
                            <TabsTrigger value="catalog" className="gap-2">
                                <Beaker className="h-4 w-4" />
                                Test Catalog
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Analytics
                            </TabsTrigger>
                        </TabsList>
                    }
                />

                <ScrollArea className='h-[85vh] flex flex-grow  rounded-md p-2'>
                    <TabsContent value="orders" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <StatCard title="Total Orders" value={stats.total} icon={ClipboardList} accentColor="primary" />
                            <StatCard title="Pending" value={stats.pending} icon={Clock} accentColor="warning" />
                            <StatCard title="Processing" value={stats.processing} icon={Activity} accentColor="info" />
                            <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} accentColor="success" />
                            <StatCard title="Urgent/STAT" value={stats.urgent} icon={AlertTriangle} accentColor="destructive" />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search orders, patients, or tests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-card border-border" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[160px] bg-input dark:bg-card border-border"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                                    <SelectContent className="bg-popover border-border">
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant='default' onClick={() => setIsNewOrderOpen(true)} className="gap-2" >
                                <Plus className="h-4 w-4" />
                                New Order
                            </Button>
                        </div>

                        <OrdersTable orders={filteredOrders} onViewOrder={(order) => setSelectedOrder(order)} onUpdateStatus={handleUpdateStatus} onPrintResult={handlePrintResult} />

                        {filteredOrders.length === 0 && (
                            <div className="text-center py-12">
                                <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                                <p className="text-muted-foreground">{searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filter criteria' : 'Create a new lab order to get started'}</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="specimens"><SpecimenTrackingView orders={orders} /></TabsContent>
                    <TabsContent value="catalog"><TestCatalog /></TabsContent>
                    <TabsContent value="analytics"><AnalyticsDashboard orders={orders} /></TabsContent>
                </ScrollArea>




            </Tabs>

            <NewOrderDialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen} onCreateOrder={handleCreateOrder} />
            <EnhancedResultEntry order={selectedOrder} open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)} onUpdateOrder={handleUpdateOrder} />

            <div className="hidden">{orderToPrint && <PrintableResult ref={printRef} order={orderToPrint} />}</div>
        </div>

    );
}
