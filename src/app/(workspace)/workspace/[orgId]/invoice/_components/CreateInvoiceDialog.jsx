import { useState } from 'react';
import { Loader, Plus, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useData } from '../../(misc)/_providers/DataProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';



export function CreateInvoiceDialog({ open, onClose, onSave }) {
    const [loading, setLoading] = useState(false)
    const { patients } = useData()

    const [formData, setFormData] = useState({
        patientName: '',
        patientId: '',
        patientEmail: '',
        patientPhone: '',
        issueDate: new Date().toISOString().split('T')[0],
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
        dueDate: '',
        status: 'draft',
        notes: '',
    });



    const handleItemChange = (index, field, value) => {
        const newItems = [...formData?.items];
        if (field === 'description') {
            newItems[index].description = value;
        } else if (field === 'quantity' || field === 'unitPrice') {
            const numValue = parseFloat(value) || 0;
            newItems[index][field] = numValue;
            newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
        }
        //setItems(newItems);
        setFormData({ ...formData, items: newItems })
    };

    const addItem = () => {
        //setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);

        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                { description: '', quantity: 1, unitPrice: 0, total: 0 }
            ]
        }));
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }));
        }
    };

    const subtotal = formData?.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const generateInvoiceNumber = () => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `INV-${year}-${random}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.patientName || !formData.patientEmail || !formData.dueDate) {
            toast.error('Fill te require field')
            return;
        }

        if (items.some((item) => !item.description || item.quantity <= 0)) {
            toast({
                title: 'Error',
                description: 'Please complete all invoice items',
                variant: 'destructive',
            });
            return;
        }

        const newInvoice = {
            invoiceNumber: generateInvoiceNumber(),
            ...formData,
            items: items.map((item, index) => ({ ...item, id: String(index + 1) })),
            subtotal,
            tax,
            discount: 0,
            total,
        };

        onSave(newInvoice);
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            patientName: '',
            patientId: '',
            patientEmail: '',
            patientPhone: '',
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            status: 'draft',
            notes: '',
        });
        setItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };




    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[80%]   p-0 [&>button:last-child]:hidden">
                <DialogHeader className={'hidden'}>
                    <DialogTitle className=" font-bold">Create New Invoice</DialogTitle>
                </DialogHeader>

                <ScrollArea className='h-[70vh] p-2'>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <Card className='p-2 rounded-md'>




                            <div className='flex flex-col gap-2 w-full'>
                                <Label >Select Patient *</Label>
                                <Select
                                    //disabled={server?.members.filter(member => member.user.role === ROLE.DOCTOR).length === 0 ? true : false}
                                    //defaultValue={server?.userId}
                                    name='patientId'
                                    onValueChange={(id) => {

                                    }}
                                >
                                    <SelectTrigger className="">
                                        <SelectValue placeholder="Select a Patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {patients?.map((patient) => {

                                                return (
                                                    <SelectItem key={patient?.id} value={patient?.id} >
                                                        <div className='flex flex-row items-center gap-2'>
                                                            <Avatar className='h-6 w-6 rounded-md'>
                                                                <AvatarImage src={patient?.avatars} alt="@shadcn" />
                                                                <AvatarFallback className='rounded-md dark:bg-sky-600'>{patient?.displayName?.substring(0, 1)}</AvatarFallback>
                                                            </Avatar>
                                                            {patient?.displayName}

                                                        </div>
                                                    </SelectItem>
                                                )
                                            })}

                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Invoice Details */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-1">
                                    <Label htmlFor="issueDate">Issue Date</Label>
                                    <Input
                                        id="issueDate"
                                        type="date"
                                        value={formData.issueDate}
                                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="dueDate">Due Date *</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="status">Status</Label>s
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, status: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>

                        {/* Items */}
                        <Card className="p-2 rounded-md">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-semibold text-foreground">Services & Items</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Item
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {formData?.items.map((item, index) => (
                                    <div key={index} className="grid gap-3 sm:grid-cols-[1fr_80px_100px_100px_40px]">
                                        <Input
                                            placeholder="Service description"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Qty"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Price"
                                            min="0"
                                            step="0.01"
                                            value={item.unitPrice || ''}
                                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                        />
                                        <div className="flex items-center font-medium text-foreground">
                                            {formatCurrency(item.total)}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            disabled={formData?.items.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2 text-right">
                                <div className="flex justify-end gap-8 text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="w-24 font-medium text-foreground">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-end gap-8 text-sm">
                                    <span className="text-muted-foreground">Tax (10%)</span>
                                    <span className="w-24 font-medium text-foreground">{formatCurrency(tax)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-end gap-8">
                                    <span className="font-semibold text-foreground text-md">Total</span>
                                    <span className="w-24 text-md font-bold text-primary">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </Card>

                        <Card className='p-2 rounded-md'>
                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional notes or payment instructions..."
                                    rows={3}
                                />
                            </div>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 justify-end">
                            <Button type="button" variant="ghost" onClick={onClose} size='sm'>
                                Cancel
                            </Button>
                            <Button variant='save' size='sm'>
                                {loading ? <Loader /> : <Save />}
                                Create Invoice
                            </Button>
                        </div>
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
