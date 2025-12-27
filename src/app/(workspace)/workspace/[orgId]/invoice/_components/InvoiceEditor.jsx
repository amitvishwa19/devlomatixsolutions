"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronRight, Loader, Plus, ReceiptIndianRupee, ReceiptText, Save, Trash2 } from "lucide-react";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useData } from "../../(misc)/_providers/DataProvider";
import { useInvoice } from "../_provider/invoiceProvider";
import AppointmentSelect from "./AppointmentSelect";
import { DatePicker } from "@/components/global/DatePicker";
import { upsertInvoice } from "../_action/upsert-invoice";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { DynamicIcon } from "lucide-react/dynamic";

const invoiceSchema = z.object({
    id: z.string().optional(),
    sku: z.string(),
    appointmentId: z.string({ required_error: "Please select a appointment.", invalid_type_error: "Please select a appointment." }).min(1, "Please select a appointment."),
    patientId: z.string(),
    serviceId: z.string({ required_error: "Select a service.", invalid_type_error: "Select a service." }).min(1, "Select a service."),
    doctorId: z.string(),
    issueDate: z.any().refine((v) => v instanceof Date, { message: "Issue date is required." }),
    dueDate: z.any().refine((v) => v instanceof Date, { message: "Due date is required." }),
    status: z.enum(["draft", "pending", "paid", "overdue", "cancelled"], { required_error: "Please select a status." }),
    items: z.array(
        z.object({
            id: z.string(),
            name: z.string().min(1, "Description is required."),
            quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
            unitPrice: z.coerce.number().min(0, "Price cannot be negative."),
            total: z.coerce.number().min(0, "Total cannot be negative.")
        })
    ).min(1, "No service selected! Select atleast one service to generate invoice"),
    category: z.string().optional(),
    subTotal: z.coerce.number(),
    discount: z.coerce.number(),
    tax: z.coerce.number(),
    taxAmount: z.coerce.number(),
    totalAmount: z.coerce.number(),
    notes: z.string().optional()
});


export function InvoiceEditor({ isOpen, onClose, onSave, mode, invoice, services, category }) {
    const { appointments } = useInvoice()
    const [loading, setLoading] = useState(false)
    const FIXED_TAX_RATE = 0;
    const TAX = 0



    const form = useForm({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            id: "",
            sku: "",
            appointmentId: "",
            patientId: "",
            doctorId: "",
            issueDate: new Date(),
            dueDate: new Date(),
            status: "draft",
            items: [],
            subTotal: 0,
            discount: 0,
            tax: TAX,
            taxAmount: 0,
            totalAmount: 0,
            notes: "",
            category: ""
        }
    });

    useEffect(() => {
        if (invoice) {
            form.reset({
                id: invoice?.id || "",
                sku: invoice?.sku || "",
                appointmentId: invoice?.appointmentId || "",
                patientId: invoice?.patientId || "",
                doctorId: invoice?.doctorId || "",
                issueDate: new Date(invoice?.issueDate) || new Date(),
                dueDate: new Date(invoice?.dueDate) || new Date(),
                status: invoice?.status || "draft",
                items: invoice?.items || [],
                subTotal: invoice?.subTotal || 0,
                discount: invoice?.discount || 0,
                tax: invoice?.tax || TAX,
                taxAmount: invoice?.taxAmount || 0,
                totalAmount: invoice?.totalAmount || 0,
                notes: invoice?.notes || "",
                category: invoice?.categoryId || "",
                serviceId: invoice?.id || ""
            });
        } else {
            form.reset({
                id: "",
                sku: "",
                serviceId: "",
                appointmentId: "",
                patientId: "",
                doctorId: "",
                issueDate: new Date(),
                dueDate: new Date(),
                status: "draft",
                items: [],
                subTotal: 0,
                discount: 0,
                tax: TAX,
                taxAmount: 0,
                totalAmount: 0,
                notes: "",
                category: ""
            });
        }

    }, [mode, invoice, form])


    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });


    const items = watch("items");
    const watchItems = watch("items");
    const discount = watch("discount");
    const taxPercent = watch("tax");

    const subtotal = useMemo(
        () =>
            (items || []).reduce((sum, item) => {
                const qty = Number(item?.quantity) || 0;
                const price = Number(item?.unitPrice) || 0;
                return sum + qty * price;
            }, 0),
        [items]
    );

    const tax = useMemo(
        () => (subtotal * (taxPercent || FIXED_TAX_RATE)) / 100,
        [subtotal, taxPercent]
    );

    const discountAmount = useMemo(
        () => (subtotal * (discount || 0)) / 100,
        [subtotal, discount]
    );

    const finalTotal = useMemo(
        () => subtotal + tax - discountAmount,
        [subtotal, tax, discountAmount]
    );

    const generateSku = () => {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, "0");
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const yy = String(now.getFullYear()).slice(-2);

        const random = Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, "0");

        return `INV-${random}-${dd}-${mm}-${yy}`;
    };

    const recomputeTotals = () => {
        const currentItems = form.getValues("items");

        const updatedItems = currentItems.map((item) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            const lineTotal = qty * price;
            return { ...item, total: lineTotal };
        });

        setValue("items", updatedItems, { shouldValidate: true });

        const subTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
        setValue("subTotal", subTotal, { shouldValidate: true });

        const discountPercent = Number(form.getValues("discount")) || 0;
        const discountAmt = (subTotal * discountPercent) / 100;
        const baseAfterDiscount = subTotal - discountAmt;

        const taxPercentValue =
            Number(form.getValues("tax")) || FIXED_TAX_RATE;
        const taxAmt = (baseAfterDiscount * taxPercentValue) / 100;

        const totalAmount = baseAfterDiscount + taxAmt;

        setValue("taxAmount", taxAmt, { shouldValidate: true });
        setValue("totalAmount", totalAmount, { shouldValidate: true });
    };

    const handleServiceSelect = (serviceId) => {
        const service = services.find((s) => s.id === serviceId);
        if (!service) return;

        const currentItems = form.getValues("items") || [];

        const exists = currentItems.some((item) => item.id === service.id);
        if (exists) return;

        const newItems = [
            ...currentItems,
            {
                id: service.id,
                name: service.name,
                unitPrice: service.price,
                quantity: 1,
                total: service.price
            }
        ];

        form.setValue("items", newItems, { shouldValidate: true });
        recomputeTotals();
    };

    const addItem = () => {
        append({
            id: crypto.randomUUID(),
            name: "",
            quantity: 1,
            unitPrice: 0,
            total: 0
        });
    };

    const removeItem = (index) => {
        remove(index);
        setTimeout(() => {
            recomputeTotals();
        }, 0);
    };

    const handleClose = () => {
        setLoading(false);
        onClose();
        form.reset();
    };

    const { execute } = useAction(upsertInvoice, {
        onSuccess: (data) => {
            onSave(data?.invoice)
            toast.success(`${mode === 'edit' ? `Invoice ${invoice?.sku} updated successfully` : `New invoice ${data?.invoice?.sku} created successfully`}`, { id: 'new-invoice' })
            handleClose()
            setLoading(false);

        },
        onError: (error) => {
            toast.error('Oops somethig went wrong ! try again later', { id: 'new-invoice' })
            setLoading(false);
        }
    })

    const onSubmit = async (data) => {

        setLoading(true);
        try {

            const sku = data.sku && data.sku.length > 0 ? data.sku : generateSku();

            const syncedItems = data.items.map((item) => ({
                ...item,
                total: Number(item.quantity) * Number(item.unitPrice)
            }));

            const subTotal = syncedItems.reduce(
                (sum, item) => sum + item.total,
                0
            );
            const discountAmt = (subTotal * (data.discount || 0)) / 100;
            const baseAfterDiscount = subTotal - discountAmt;
            const taxAmt =
                (baseAfterDiscount * (data.tax || FIXED_TAX_RATE)) / 100;
            const totalAmount = baseAfterDiscount + taxAmt;

            const payload = {
                ...data,
                sku,
                items: syncedItems,
                subTotal,
                taxAmount: taxAmt,
                totalAmount
            };
            //toast.loading('Creating new Invoice please wait...', { id: 'new-invoice' })

            await execute({ payload })


        } catch (e) {
            console.error(e);
        } finally {

        }
    };



    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent className="min-w-[620px] bg-transparent  border-0 p-2">
                <div className='bg-card h-full rounded-md p-2'>

                    <SheetHeader>
                        <SheetTitle className="flex flex-row items-center gap-2">
                            <ReceiptIndianRupee className="h-5 w-5 text-sky-500" />
                            {mode === 'add' ? 'Create new Invoice' : invoice?.sku}
                        </SheetTitle>
                        <SheetDescription className='text-xs text-muted-foreground'>
                            Generate detailed and accurate invoices effortlessly — streamline your hospital’s billing process with precision and reliability.
                        </SheetDescription>
                    </SheetHeader>

                    <Form {...form}>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <ScrollArea className="h-[82vh] p-2 space-y-4">
                                <div className="flex flex-col gap-4">
                                    {/* Header card */}
                                    <Card className="p-2 rounded-md bg-primary/10 dark:bg-darkFocusColor/50">
                                        <div className="flex flex-col gap-4">

                                            {/* Appointment */}
                                            <div>
                                                <FormField
                                                    control={control}
                                                    name="appointmentId"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>
                                                                Select Appointment *
                                                            </FormLabel>
                                                            <FormControl>
                                                                <AppointmentSelect
                                                                    appointments={appointments}
                                                                    value={field.value}
                                                                    onValueChange={(e) => {
                                                                        field.onChange(e.id);
                                                                        setValue("patientId", e.patientId, {
                                                                            shouldValidate: true
                                                                        });
                                                                        setValue("doctorId", e.doctorId, {
                                                                            shouldValidate: true
                                                                        });
                                                                    }}
                                                                    placeholder="Search and select an appointment..."
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2 items-center">
                                                {/* Issue date */}
                                                <FormField
                                                    control={control}
                                                    name="issueDate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Issue Date *</FormLabel>
                                                            <FormControl>
                                                                <DatePicker
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    placeholder="Select issue date"
                                                                    className="bg-transparent"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Due date */}
                                                <FormField
                                                    control={control}
                                                    name="dueDate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Due Date *</FormLabel>
                                                            <FormControl>
                                                                <DatePicker
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    placeholder="Select due date"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />


                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2 items-center">

                                                {/* Status */}
                                                <FormField
                                                    control={control}
                                                    name="status"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel htmlFor="status">
                                                                Status
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="draft">
                                                                            Draft
                                                                        </SelectItem>
                                                                        <SelectItem value="pending">
                                                                            Pending
                                                                        </SelectItem>
                                                                        <SelectItem value="paid">
                                                                            Paid
                                                                        </SelectItem>
                                                                        <SelectItem value="overdue">
                                                                            Over Due
                                                                        </SelectItem>
                                                                        <SelectItem value="cancelled">
                                                                            Cancelled
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />


                                                {/* Category */}
                                                <FormField
                                                    control={form.control}
                                                    name="category"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Category</FormLabel>
                                                            <Select
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select category" />
                                                                    </SelectTrigger>
                                                                </FormControl>

                                                                <SelectContent>
                                                                    {category?.children?.map((cat) => (
                                                                        <SelectGroup key={cat.id}>
                                                                            <SelectItem value={cat.id} className='pl-4 font-medium text-sm'>
                                                                                <div className='flex flex-row items-center gap-2'>
                                                                                    {cat.icon ? <DynamicIcon size={14} name={cat.icon} /> : <DynamicIcon size={14} name={'folder'} />}
                                                                                    <span>All {cat.name}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            {cat?.children?.map((subCat) => (

                                                                                <SelectItem key={subCat.id} value={subCat.id} className='pl-8 font-medium text-sm'>
                                                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                                                        <ChevronRight className="h-3 w-3" />
                                                                                        <span className="text-foreground">{subCat.name}</span>
                                                                                    </span>
                                                                                </SelectItem>
                                                                            ))}

                                                                        </SelectGroup>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                            </div>

                                        </div>
                                    </Card>

                                    {/* Items card */}
                                    <Card className="p-2 rounded-md bg-primary/10 dark:bg-darkFocusColor/50">
                                        <div className="flex flex-col gap-4 mt-2">
                                            {/* Quick service select */}
                                            <div>
                                                <FormField
                                                    control={control}
                                                    name="serviceId"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col gap-2">
                                                            <FormLabel>
                                                                Select a service
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={(value) => {
                                                                        field.onChange(value);
                                                                        handleServiceSelect(value); // still adds to items
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a service" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectGroup>
                                                                            {services?.map((service) => (
                                                                                <SelectItem key={service.id} value={service.id}>
                                                                                    <div className="flex flex-row items-center gap-2 text-sm font-medium">
                                                                                        {service.name}
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectGroup>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                {/* Items-level error */}
                                                {/* <div className="flex w-full items-center justify-center">
                                                    {errors.items?.message &&
                                                        fields.length === 0 && (
                                                            <p className="text-xs text-muted-foreground/60 flex flex-row items-center gap-2 italic">
                                                                <AlertCircle size={14} />
                                                                {errors.items.message}
                                                            </p>
                                                        )}
                                                </div> */}

                                                {/* Item lines */}
                                                {fields.map((f, index) => (
                                                    <div
                                                        key={f.id}
                                                        className="grid gap-3 sm:grid-cols-[1fr_80px_100px_100px_40px] items-center"
                                                    >
                                                        {/* Name */}
                                                        <FormField
                                                            control={control}
                                                            name={`items.${index}.name`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Service name"
                                                                            {...field}
                                                                            onChange={(e) => {
                                                                                field.onChange(e);
                                                                                recomputeTotals();
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Quantity */}
                                                        <FormField
                                                            control={control}
                                                            name={`items.${index}.quantity`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            min="1"
                                                                            placeholder="Qty"
                                                                            value={field.value}
                                                                            onChange={(e) => {
                                                                                field.onChange(e.target.value);
                                                                                recomputeTotals();
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Unit price */}
                                                        <FormField
                                                            control={control}
                                                            name={`items.${index}.unitPrice`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            step="50"
                                                                            disabled
                                                                            placeholder="Price"
                                                                            value={field.value ?? ""}
                                                                            onChange={(e) => {
                                                                                field.onChange(e.target.value);
                                                                                recomputeTotals();
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Line total */}
                                                        <FormField
                                                            control={control}
                                                            name={`items.${index}.total`}
                                                            render={() => {
                                                                const quantity = Number(
                                                                    watchItems?.[index]?.quantity || 0
                                                                );
                                                                const price = Number(
                                                                    watchItems?.[index]?.unitPrice || 0
                                                                );
                                                                const lineTotal = quantity * price;

                                                                return (
                                                                    <FormItem>
                                                                        <div className="flex items-center font-medium text-foreground">
                                                                            ₹ {lineTotal}
                                                                        </div>
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />

                                                        {/* Remove */}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Totals */}
                                            <Separator />

                                            <div className="space-y-2 text-right">
                                                <div className="flex flex-row justify-between gap-8 text-sm w-full">
                                                    <span className="text-muted-foreground">
                                                        Subtotal
                                                    </span>
                                                    <span className="font-medium text-foreground">
                                                        ₹ {subtotal.toFixed(2)}
                                                    </span>
                                                </div>

                                                <div className="flex flex-row justify-between gap-8 text-sm">
                                                    <span className="text-muted-foreground">
                                                        Tax ({taxPercent || FIXED_TAX_RATE}%)
                                                    </span>
                                                    <span className="w-24 font-medium text-foreground">
                                                        ₹ {tax.toFixed(2)}
                                                    </span>
                                                </div>

                                                <div className="flex flex-row justify-between gap-8 text-sm">
                                                    <span className="text-muted-foreground">
                                                        Discount (%)
                                                    </span>
                                                    <span className="w-24 font-medium text-foreground">
                                                        <FormField
                                                            control={control}
                                                            name="discount"
                                                            render={({ field }) => (
                                                                <FormItem className="w-18 ml-auto">
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            value={field.value ?? 0}
                                                                            onChange={(e) => {
                                                                                field.onChange(e.target.value);
                                                                                recomputeTotals();
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </span>
                                                    ₹ {discountAmount.toFixed(2)}
                                                </div>

                                                <Separator className="my-2" />

                                                <div className="flex justify-end gap-8">
                                                    <span className="font-semibold text-foreground text-md">
                                                        Total
                                                    </span>
                                                    <span className="w-24 text-md font-bold text-primary">
                                                        ₹ {finalTotal.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Notes */}
                                    <Card className="p-2 rounded-md bg-primary/10 dark:bg-darkFocusColor/50">
                                        <FormField
                                            control={control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel htmlFor="notes">
                                                        Notes (Optional)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            id="notes"
                                                            placeholder="Additional notes or payment instructions..."
                                                            rows={3}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </Card>

                                </div>
                            </ScrollArea>

                            <SheetFooter className="flex flex-row items-center gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleClose}
                                    size="sm"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="save"
                                    size="sm"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader className=" animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    {mode === 'edit' ? 'Update' : 'Create'}  Invoice
                                </Button>
                            </SheetFooter>

                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
