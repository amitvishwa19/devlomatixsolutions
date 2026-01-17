import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Plus, Download, Eye } from "lucide-react";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useModal } from '@/hooks/useModal';
import { Button } from '@/components/ui/button'

export function AddInvoice() {

    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "addinvoice";

    const handleOpenChange = () => {
        onClose()
    }

    return (

        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <DialogContent className="max-w-2xl dark:bg-darkPrimaryBackground" >
                <DialogHeader>
                    <DialogTitle>Generate New Invoice</DialogTitle>
                    <DialogDescription>Create a new invoice for a patient visit</DialogDescription>
                </DialogHeader>
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="patient">Patient Name</Label>
                            <Input id="patient" placeholder="Enter patient name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patientId">Patient ID</Label>
                            <Input id="patientId" placeholder="Enter patient ID" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="service">Service Type</Label>
                            <Select required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="consultation">Consultation</SelectItem>
                                    <SelectItem value="surgery">Surgery</SelectItem>
                                    <SelectItem value="diagnostic">Diagnostic Test</SelectItem>
                                    <SelectItem value="therapy">Therapy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount ($)</Label>
                            <Input id="amount" type="number" placeholder="0.00" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Service Description</Label>
                        <Input id="description" placeholder="Enter service description" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="insurance">Insurance Provider</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Insurance</SelectItem>
                                    <SelectItem value="blue-cross">Blue Cross</SelectItem>
                                    <SelectItem value="aetna">Aetna</SelectItem>
                                    <SelectItem value="united">United Healthcare</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Service Date</Label>
                            <Input id="date" type="date" required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Generate Invoice</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
