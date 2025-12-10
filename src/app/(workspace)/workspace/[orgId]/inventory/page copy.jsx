'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React, { useState } from 'react'
import { InventoryTable } from './_components/InventoryTable';
import { InventoryDialog } from './_components/InventoryDialog';
import { useModal } from '@/hooks/useModal';



const initialInventory = [
    {
        id: "1",
        name: "Surgical Masks (N95)",
        category: "PPE",
        quantity: 1500,
        unit: "pieces",
        minStock: 500,
        location: "Storage Room A",
        expiryDate: "2026-12-31",
        supplier: "MedSupply Co",
        lastRestocked: "2025-11-15",
    },
    {
        id: "2",
        name: "Disposable Gloves",
        category: "PPE",
        quantity: 3000,
        unit: "pairs",
        minStock: 1000,
        location: "Storage Room A",
        expiryDate: "2027-06-30",
        supplier: "HealthPro Inc",
        lastRestocked: "2025-11-10",
    },
    {
        id: "3",
        name: "Syringes (10ml)",
        category: "Medical Equipment",
        quantity: 250,
        unit: "pieces",
        minStock: 500,
        location: "Storage Room B",
        expiryDate: "2026-08-15",
        supplier: "MediTech Ltd",
        lastRestocked: "2025-10-20",
    },
    {
        id: "4",
        name: "IV Fluid Bags (500ml)",
        category: "Medications",
        quantity: 800,
        unit: "bags",
        minStock: 300,
        location: "Pharmacy",
        expiryDate: "2026-03-30",
        supplier: "PharmaCare",
        lastRestocked: "2025-11-18",
    },
    {
        id: "5",
        name: "Bandages (Sterile)",
        category: "Medical Supplies",
        quantity: 1200,
        unit: "pieces",
        minStock: 400,
        location: "Storage Room C",
        expiryDate: "2027-01-15",
        supplier: "MedSupply Co",
        lastRestocked: "2025-11-12",
    },
    {
        id: "6",
        name: "Paracetamol 500mg",
        category: "Medications",
        quantity: 100,
        unit: "boxes",
        minStock: 200,
        location: "Pharmacy",
        expiryDate: "2026-09-20",
        supplier: "PharmaCare",
        lastRestocked: "2025-09-30",
    },
    {
        id: "7",
        name: "Oxygen Cylinders",
        category: "Medical Equipment",
        quantity: 45,
        unit: "units",
        minStock: 20,
        location: "Equipment Room",
        supplier: "OxyGen Medical",
        lastRestocked: "2025-11-20",
    },
    {
        id: "8",
        name: "Thermometers (Digital)",
        category: "Medical Equipment",
        quantity: 80,
        unit: "pieces",
        minStock: 30,
        location: "Storage Room B",
        supplier: "MediTech Ltd",
        lastRestocked: "2025-11-05",
    },
];
export default function InventoryPage() {

    const [inventory, setInventory] = useState(initialInventory);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { onOpen } = useModal()

    const categories = ["all", ...Array.from(new Set(inventory.map((item) => item.category)))];

    const filteredInventory = inventory.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddItem = () => {
        setEditingItem(null);
        setDialogOpen(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setDialogOpen(true);
    };

    const handleDeleteItem = (id) => {
        setInventory(inventory.filter((item) => item.id !== id));
    };

    const handleSaveItem = (item) => {
        if (editingItem) {
            setInventory(inventory.map((i) => (i.id === item.id ? item : i)));
        } else {
            setInventory([...inventory, { ...item, id: Date.now().toString() }]);
        }
        setDialogOpen(false);
        setEditingItem(null);
    };
    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>
            <div className='w-full dark:bg-[#151D24] p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Inventory</h2>
                    <h2 className='text-xs text-white/50'>Track and manage hospital medical supplies and equipment</h2>
                </div>

                <Button variant={'outline'} size={'sm'} className='' onClick={() => { onOpen('addinventory') }}>Add Inventory</Button>
            </div>


            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-lg border dark:bg-darkSecondaryBackground">
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
                </div>
                <div className="bg-card p-4 rounded-lg border dark:bg-darkSecondaryBackground">
                    <p className="text-sm text-muted-foreground">Low Stock Items</p>
                    <p className="text-2xl font-bold text-destructive">
                        {inventory.filter((item) => item.quantity < item.minStock).length}
                    </p>
                </div>
                <div className="bg-card p-4 rounded-lg border dark:bg-darkSecondaryBackground">
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold text-foreground">{categories.length - 1}</p>
                </div>
                <div className="bg-card p-4 rounded-lg border dark:bg-darkSecondaryBackground">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-foreground">$125,450</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card p-4 rounded-lg border dark:bg-darkSecondaryBackground">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, supplier, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category === "all" ? "All Categories" : category}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className=' flex flex-1 dark:bg-darkSecondaryBackground h-full rounded-md'>
                {/* Inventory Table */}
                <InventoryTable
                    inventory={filteredInventory}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                />

                {/* Add/Edit Dialog */}
                <InventoryDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    item={editingItem}
                    onSave={handleSaveItem}
                />

            </div>

        </div>
    )
}
