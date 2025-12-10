import React, { useState } from 'react'
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { StatCard } from './StatCard';
import { CategoryCard } from './CategoryCard';
import { InventoryTable } from './InventoryTable';
import { LowStockAlert } from './LowStockAlert';
import { RecentActivity } from './RecentActivity';


export const categories = [
    { id: '1', name: 'Medications', icon: 'Pill', count: 245 },
    { id: '2', name: 'Surgical Supplies', icon: 'Scissors', count: 89 },
    { id: '3', name: 'Medical Devices', icon: 'Activity', count: 156 },
    { id: '4', name: 'Lab Equipment', icon: 'FlaskConical', count: 67 },
    { id: '5', name: 'PPE', icon: 'Shield', count: 312 },
    { id: '6', name: 'First Aid', icon: 'Cross', count: 98 },
];

export const inventoryItems = [
    {
        id: '1',
        name: 'Paracetamol 500mg',
        category: 'Medications',
        sku: 'MED-001',
        quantity: 2500,
        minStock: 500,
        unit: 'tablets',
        location: 'Pharmacy A-12',
        expiryDate: '2025-08-15',
        supplier: 'PharmaCorp Ltd.',
        unitPrice: 0.15,
        lastUpdated: '2024-12-09',
    },
    {
        id: '2',
        name: 'Surgical Gloves (Sterile)',
        category: 'Surgical Supplies',
        sku: 'SUR-045',
        quantity: 150,
        minStock: 200,
        unit: 'boxes',
        location: 'Storage B-03',
        supplier: 'MedSupply Inc.',
        unitPrice: 12.50,
        lastUpdated: '2024-12-08',
    },
    {
        id: '3',
        name: 'Digital Thermometer',
        category: 'Medical Devices',
        sku: 'DEV-112',
        quantity: 45,
        minStock: 20,
        unit: 'units',
        location: 'Equipment Room C-01',
        supplier: 'TechMed Solutions',
        unitPrice: 35.00,
        lastUpdated: '2024-12-09',
    },
    {
        id: '4',
        name: 'N95 Respirator Masks',
        category: 'PPE',
        sku: 'PPE-089',
        quantity: 0,
        minStock: 500,
        unit: 'pieces',
        location: 'PPE Storage D-02',
        supplier: '3M Healthcare',
        unitPrice: 2.50,
        lastUpdated: '2024-12-07',
    },
    {
        id: '5',
        name: 'Blood Collection Tubes',
        category: 'Lab Equipment',
        sku: 'LAB-033',
        quantity: 3200,
        minStock: 1000,
        unit: 'tubes',
        location: 'Lab Storage E-05',
        expiryDate: '2026-03-20',
        supplier: 'BD Medical',
        unitPrice: 0.45,
        lastUpdated: '2024-12-09',
    },
    {
        id: '6',
        name: 'Insulin Syringes',
        category: 'Medications',
        sku: 'MED-078',
        quantity: 800,
        minStock: 300,
        unit: 'pieces',
        location: 'Pharmacy A-08',
        supplier: 'PharmaCorp Ltd.',
        unitPrice: 0.35,
        lastUpdated: '2024-12-08',
    },
    {
        id: '7',
        name: 'Surgical Scalpels #10',
        category: 'Surgical Supplies',
        sku: 'SUR-023',
        quantity: 75,
        minStock: 100,
        unit: 'pieces',
        location: 'OR Supply F-01',
        supplier: 'Surgical Edge Co.',
        unitPrice: 8.75,
        lastUpdated: '2024-12-09',
    },
    {
        id: '8',
        name: 'Portable ECG Monitor',
        category: 'Medical Devices',
        sku: 'DEV-201',
        quantity: 12,
        minStock: 5,
        unit: 'units',
        location: 'Equipment Room C-03',
        supplier: 'TechMed Solutions',
        unitPrice: 2500.00,
        lastUpdated: '2024-12-05',
    },
    {
        id: '9',
        name: 'Disposable Face Shields',
        category: 'PPE',
        sku: 'PPE-102',
        quantity: 450,
        minStock: 200,
        unit: 'pieces',
        location: 'PPE Storage D-01',
        supplier: '3M Healthcare',
        unitPrice: 4.25,
        lastUpdated: '2024-12-08',
    },
    {
        id: '10',
        name: 'Bandage Rolls 4"',
        category: 'First Aid',
        sku: 'FA-015',
        quantity: 280,
        minStock: 150,
        unit: 'rolls',
        location: 'First Aid Station G-02',
        supplier: 'MedSupply Inc.',
        unitPrice: 2.10,
        lastUpdated: '2024-12-09',
    },
];

export function InventoryDashboard() {

    const [selectedCategory, setSelectedCategory] = useState(null);

    const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockCount = inventoryItems.filter(
        (item) => item.quantity <= item.minStock && item.quantity > 0
    ).length;
    const outOfStockCount = inventoryItems.filter((item) => item.quantity === 0).length;
    const totalValue = inventoryItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
    );

    const filteredItems = selectedCategory ? inventoryItems.filter((item) => item.category === selectedCategory) : inventoryItems;

    return (
        <div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Items"
                    value={totalItems.toLocaleString()}
                    change="+12% from last month"
                    changeType="positive"
                    icon={Package}
                />
                <StatCard
                    title="Low Stock Items"
                    value={lowStockCount}
                    change={`${outOfStockCount} out of stock`}
                    changeType="negative"
                    icon={AlertTriangle}
                    iconColor="text-warning"
                />
                <StatCard
                    title="Categories"
                    value={categories.length}
                    change="All categories active"
                    changeType="neutral"
                    icon={TrendingUp}
                />
                <StatCard
                    title="Inventory Value"
                    value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    change="+8% from last month"
                    changeType="positive"
                    icon={DollarSign}
                />
            </div>

            {/* Categories */}
            <div className="mb-2">
                <h2 className="text-md font-semibold text-foreground mb-2">Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            isActive={selectedCategory === category.name}
                            onClick={() =>
                                setSelectedCategory(
                                    selectedCategory === category.name ? null : category.name
                                )
                            }
                        />
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <div className="lg:col-span-2">
                    <InventoryTable items={filteredItems.slice(0, 6)} />
                </div>
                <div className="space-y-2">
                    <LowStockAlert items={inventoryItems.slice(0, 10)} />
                    <RecentActivity />
                </div>
            </div>





        </div >
    )
}
