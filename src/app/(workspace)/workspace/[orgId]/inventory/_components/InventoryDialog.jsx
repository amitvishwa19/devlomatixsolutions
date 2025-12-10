import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/useModal";


export const InventoryDialog = ({ open, onOpenChange, item, onSave }) => {
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "addinventory";

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        quantity: 0,
        unit: "",
        minStock: 0,
        location: "",
        expiryDate: "",
        supplier: "",
        lastRestocked: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            setFormData({
                name: "",
                category: "",
                quantity: 0,
                unit: "",
                minStock: 0,
                location: "",
                expiryDate: "",
                supplier: "",
                lastRestocked: new Date().toISOString().split("T")[0],
            });
        }
    }, [item, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleOpenChange = () => {
        onClose()
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={() => { handleOpenChange() }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-darkPrimaryBackground">
                <DialogHeader>
                    <DialogTitle>{item ? "Edit Inventory Item" : "Add New Inventory Item"}</DialogTitle>
                    <DialogDescription>
                        {item ? "Update the details of the inventory item" : "Enter the details of the new inventory item"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Item Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit *</Label>
                            <Input
                                id="unit"
                                value={formData.unit}
                                onChange={(e) => handleChange("unit", e.target.value)}
                                placeholder="e.g., pieces, boxes, bags"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minStock">Minimum Stock Level *</Label>
                            <Input
                                id="minStock"
                                type="number"
                                value={formData.minStock}
                                onChange={(e) => handleChange("minStock", parseInt(e.target.value) || 0)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => handleChange("location", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supplier">Supplier *</Label>
                            <Input
                                id="supplier"
                                value={formData.supplier}
                                onChange={(e) => handleChange("supplier", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastRestocked">Last Restocked *</Label>
                            <Input
                                id="lastRestocked"
                                type="date"
                                value={formData.lastRestocked}
                                onChange={(e) => handleChange("lastRestocked", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => handleChange("expiryDate", e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" size={'sm'} onClick={() => handleOpenChange()}>
                            Cancel
                        </Button>
                        <Button variant="outline" size={'sm'}>{item ? "Update" : "Add"} Item</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};