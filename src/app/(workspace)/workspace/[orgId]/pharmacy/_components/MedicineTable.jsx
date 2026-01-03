import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Edit2, Trash2, Plus, AlertTriangle, Calendar, ScanBarcode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddMedicineDialog } from './AddMedicineDialog';
import { BarcodeScanner } from './BarcodeScanner';
import { toast } from '@/hooks/use-toast';
import { categories } from '../_data/mockData';

const stockStatuses = ['All Status', 'In Stock', 'Low Stock', 'Out of Stock'];
const expiryFilters = ['All Expiry', 'Expiring in 30 days', 'Expiring in 90 days', 'Expired'];

export function MedicineTable({ medicines, onEdit, onDelete, onAdd }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [stockStatus, setStockStatus] = useState('All Status');
    const [expiryFilter, setExpiryFilter] = useState('All Expiry');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);

    const handleBarcodeScan = (barcode) => {
        const medicine = medicines.find(m => m.barcode === barcode);
        if (medicine) {
            setSearch(medicine.name);
            toast({
                title: 'Medicine Found',
                description: `${medicine.name} - ${medicine.location}`,
            });
        } else {
            toast({
                title: 'Not Found',
                description: `No medicine found with barcode: ${barcode}`,
                variant: 'destructive',
            });
        }
    };
    const filteredMedicines = medicines.filter((medicine) => {
        const matchesSearch =
            medicine.name.toLowerCase().includes(search.toLowerCase()) ||
            medicine.genericName.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
            category === 'All Categories' || medicine.category === category;

        // Stock status filter
        let matchesStock = true;
        if (stockStatus === 'In Stock') matchesStock = medicine.status === 'in-stock';
        else if (stockStatus === 'Low Stock') matchesStock = medicine.status === 'low-stock';
        else if (stockStatus === 'Out of Stock') matchesStock = medicine.status === 'out-of-stock';

        // Expiry filter
        let matchesExpiry = true;
        const today = new Date();
        const expiryDate = new Date(medicine.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (expiryFilter === 'Expiring in 30 days') matchesExpiry = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        else if (expiryFilter === 'Expiring in 90 days') matchesExpiry = daysUntilExpiry <= 90 && daysUntilExpiry > 0;
        else if (expiryFilter === 'Expired') matchesExpiry = daysUntilExpiry <= 0;

        return matchesSearch && matchesCategory && matchesStock && matchesExpiry;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'in-stock':
                return <Badge className="badge-success border">In Stock</Badge>;
            case 'low-stock':
                return <Badge className="badge-warning border">Low Stock</Badge>;
            case 'out-of-stock':
                return <Badge className="badge-destructive border">Out of Stock</Badge>;
            default:
                return null;
        }
    };

    const getExpiryBadge = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 0) {
            return <Badge variant="destructive" className="text-xs">Expired</Badge>;
        } else if (daysUntilExpiry <= 30) {
            return <Badge variant="outline" className="text-xs border-destructive text-destructive">Expires soon</Badge>;
        } else if (daysUntilExpiry <= 90) {
            return <Badge variant="outline" className="text-xs border-warning text-warning">90 days</Badge>;
        }
        return null;
    };

    // Summary stats
    const lowStockCount = medicines.filter(m => m.status === 'low-stock').length;
    const outOfStockCount = medicines.filter(m => m.status === 'out-of-stock').length;
    const expiringCount = medicines.filter(m => {
        const daysUntilExpiry = Math.ceil((new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;

    return (
        <div className="space-y-2">

            <div className='p-2 bg-card space-y-2 rounded-md border hover:border-primary/30 transition-colors animate-fade-in'>
                {/* Quick Stats */}
                {(lowStockCount > 0 || outOfStockCount > 0 || expiringCount > 0) && (
                    <div className="flex flex-wrap gap-2 p-3 bg-secondary/30 rounded-lg border border-border">
                        {lowStockCount > 0 && (
                            <Badge variant="outline" className="border-warning text-warning cursor-pointer" onClick={() => setStockStatus('Low Stock')}>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {lowStockCount} Low Stock
                            </Badge>
                        )}
                        {outOfStockCount > 0 && (
                            <Badge variant="outline" className="border-destructive text-destructive cursor-pointer" onClick={() => setStockStatus('Out of Stock')}>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {outOfStockCount} Out of Stock
                            </Badge>
                        )}
                        {expiringCount > 0 && (
                            <Badge variant="outline" className="border-orange-500 text-orange-500 cursor-pointer" onClick={() => setExpiryFilter('Expiring in 30 days')}>
                                <Calendar className="w-3 h-3 mr-1" />
                                {expiringCount} Expiring Soon
                            </Badge>
                        )}
                        {(stockStatus !== 'All Status' || expiryFilter !== 'All Expiry') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => { setStockStatus('All Status'); setExpiryFilter('All Expiry'); }}
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4">

                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search medicines by name or generic name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-secondary/50 border-border"
                        />
                    </div>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full lg:w-44 bg-secondary/50 border-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={stockStatus} onValueChange={setStockStatus}>
                        <SelectTrigger className="w-full lg:w-40 bg-secondary/50 border-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {stockStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={expiryFilter} onValueChange={setExpiryFilter}>
                        <SelectTrigger className="w-full lg:w-48 bg-secondary/50 border-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {expiryFilters.map((filter) => (
                                <SelectItem key={filter} value={filter}>
                                    {filter}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setDialogOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Medicine
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-md bg-card hover:border-primary/30 transition-colors animate-fade-in">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Name</TableHead>
                            <TableHead className="text-muted-foreground">Category</TableHead>
                            <TableHead className="text-muted-foreground">Batch</TableHead>
                            <TableHead className="text-muted-foreground">Qty</TableHead>
                            <TableHead className="text-muted-foreground">Expiry</TableHead>
                            <TableHead className="text-muted-foreground">Price</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                            <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMedicines.map((medicine, index) => (
                            <TableRow
                                key={medicine.id}
                                className={cn(
                                    'border-border hover:bg-secondary/30 transition-colors',
                                    'animate-fade-in'
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <TableCell>
                                    <div>
                                        <p className="font-medium text-foreground">{medicine.name}</p>
                                        <p className="text-sm text-muted-foreground">{medicine.genericName}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{medicine.category}</TableCell>
                                <TableCell className="font-mono text-sm text-muted-foreground">
                                    {medicine.batchNumber}
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={cn(
                                            'font-medium',
                                            medicine.quantity <= medicine.reorderLevel
                                                ? 'text-warning'
                                                : 'text-foreground'
                                        )}
                                    >
                                        {medicine.quantity}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">{medicine.expiryDate}</span>
                                        {getExpiryBadge(medicine.expiryDate)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-foreground">₹{medicine.sellingPrice.toFixed(2)}</TableCell>
                                <TableCell>{getStatusBadge(medicine.status)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit?.(medicine)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete?.(medicine.id)}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredMedicines.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No medicines found matching your criteria
                    </div>
                )}
            </div>

            <AddMedicineDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onAdd={onAdd}
            />

            <BarcodeScanner
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onScan={handleBarcodeScan}
            />
        </div>
    );
}
