import { useEffect, useState } from 'react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, User, Stethoscope, Pill, BookHeart, CirclePlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { z } from "zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import AppointmentSelect from '../../invoice/_components/AppointmentSelect';
import { useAction } from '@/hooks/use-action';
import { upsertPrescription } from '../_action/upsert-prescription';
import { toast } from 'sonner'


const emptyMedication = {
    id: Date.now().toString(),
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
};

const generateSku = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);

    const random = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");

    return `PRS-${random}-${dd}-${mm}-${yy}`;
};

const prescriptionSchema = z.object({
    id: z.string().optional(),
    sku: z.string(),
    appointmentId: z.string({ required_error: "Please select a appointment.", invalid_type_error: "Please select a appointment." }).min(1, "Please select a appointment."),
    diagnosis: z.string().min(1, "Please provide diagnosis for prescription"),
    items: z.array(
        z.object({
            id: z.string(),
            name: z.string().min(1, "Medicine name is required."),
            dosage: z.string().min(1, "Medicine dose is required, i.e 500 mg"),
            frequency: z.string().min(1, "Medicine dose is required, i.e 1-0-1-1"),
            duration: z.coerce.number().min(1, "Duration must be at least 1."),
            instruction: z.string().optional(),
        })
    ).min(1, "No medicine is prescribed, at least 1 item is required to generate prescription"),
    category: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["draft", "pending", "dispensed", "cancelled"], { required_error: "Please select a status." }),
});

export function PrescriptionEditor({ isOpen, onClose, onOpenChange, onSave, appointments, categories }) {
    const patients = [];
    const doctors = [];

    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [medications, setMedications] = useState([{ ...emptyMedication }]);




    const form = useForm({
        resolver: zodResolver(prescriptionSchema),
        defaultValues: {
            id: "",
            sku: generateSku(),
            appointmentId: "",
            diagnosis: "",
            category: "",
            items: [],
            notes: "",
            status: "draft",
        }
    });

    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    // ✅ WATCH FORM CHANGES TO UPDATE SKU
    const watchedValues = useWatch({ control, defaultValue: {}, });

    // ✅ REGENERATE SKU ON ANY FORM CHANGE
    useEffect(() => {
        if (isOpen) {
            const newSku = generateSku();
            setValue("sku", newSku, { shouldValidate: false, shouldDirty: false });
        }
    }, [watchedValues.appointmentId, watchedValues.diagnosis, fields.length, setValue, isOpen]);


    // ✅ AUTO ADD ONE EMPTY LINE WHEN MODAL OPENS
    useEffect(() => {
        if (isOpen && fields.length === 0) {
            append(emptyMedication);
        }
        if (!isOpen) {
            reset();
        }
    }, [isOpen, fields.length, append, reset]);


    const handleOpenChange = () => {
        onClose()
        form.reset()
    }

    const { execute } = useAction(upsertPrescription, {
        onSuccess: (data) => {
            toast.success('New Prescription created successfully', { id: 'new-prescription' })
            onSave(data?.prescription)
        },
        onError: (error) => {
            toast.error('Oops somethig went wrong ! try again later', { id: 'new-prescription' })
            setLoading(false);
        }
    })

    const onSubmit = async (formData) => {
        console.log(formData)
        toast.loading('Creating new prescription, please wait....', { id: 'new-prescription' })
        await execute({ formData })
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent className=" min-w-[620px] bg-transparent p-2 border-l-0 ">

                <div className='bg-card rounded-md h-full'>
                    <SheetHeader className={'px-4 self-center'}>
                        <SheetTitle className="text-xl font-display flex flex-row items-center gap-2 text-md">
                            <BookHeart className='h-5 w-5 text-sky-500' />
                            Create New Prescription
                        </SheetTitle>
                        <SheetDescription className='text-xs text-muted-foreground'>
                            New Prescription: Streamlined Care, Unmatched Accuracy – Transform Patient Treatment with Swift, Secure Prescriptions
                        </SheetDescription>
                    </SheetHeader>


                    <Form {...form}>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >

                            <ScrollArea className=" h-[82vh] p-4">
                                <div className='flex flex-col gap-4'>
                                    <div className='flex flex-col gap-4'>


                                        {/* Select Appointment */}
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

                                        {/* Diagnosis */}
                                        <div>
                                            <FormField
                                                control={control}
                                                name="diagnosis"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel htmlFor="diagnosis">
                                                            Diagnosis *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                id="notes"
                                                                placeholder="Provide a diagnosis for the prescription"
                                                                rows={3}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Status and category */}
                                        <div className='grid grid-cols-2 gap-4'>
                                            {/* Status Select */}
                                            <FormField
                                                control={control}
                                                name="status"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-xs'>Prescription Status *</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} className='w-full'>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select status" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="draft">Draft</SelectItem>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="dispensed">Dispensed</SelectItem>
                                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* Category Select */}
                                            <FormField
                                                control={control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-xs'>Category</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select category" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {categories.map((category) => (
                                                                    <SelectItem key={category.id} value={category.id}>
                                                                        {category.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                        </div>

                                        <Separator />

                                        {/* Medications */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Pill className="h-5 w-5 text-sky-500" />
                                                    <Label className="text-sm font-semibold">Medications *</Label>
                                                </div>
                                                <CirclePlus className='h-5 w-5 cursor-pointer text-sky-500' onClick={() => append({ ...emptyMedication, id: Date.now().toString() })} />

                                            </div>


                                            {fields?.map((m, index) => (
                                                <div key={m.id} className="border rounded-lg p-4 space-y-4 relative">
                                                    {fields.length > 1 && (
                                                        <div className='flex flex-row justify-end'>
                                                            <Trash2 className='h-4 w-4 cursor-pointer text-muted-foreground' onClick={() => {
                                                                if (fields.length > 1) {
                                                                    remove(index);
                                                                }
                                                            }} />
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* Name */}
                                                        <FormField
                                                            control={control}
                                                            name={`items.${index}.name`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className='text-xs'>
                                                                        Medication Name *
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="e.g., Amoxicillin"
                                                                            {...field}
                                                                            onChange={(e) => {
                                                                                field.onChange(e);
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={control}
                                                            name={`items.${index}.dosage`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className='text-xs'>
                                                                        Dosage *
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="e.g., 500mg"
                                                                            {...field}
                                                                            onChange={(e) => {
                                                                                field.onChange(e);
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={control}
                                                            name={`items.${index}.frequency`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className='text-xs'>
                                                                        Frequency *
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="e.g., 1-0-0-1"
                                                                            {...field}
                                                                            onChange={(e) => {
                                                                                field.onChange(e);
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={control}
                                                            name={`items.${index}.duration`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className='text-xs'>
                                                                        Duration *
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="e.g., 7 days"
                                                                            {...field}
                                                                            onChange={(e) => {
                                                                                field.onChange(e);
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                    </div>

                                                    <div>
                                                        <FormField
                                                            control={control}
                                                            name={`items.${index}.instructions`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className='text-xs'>
                                                                        Special Instructions
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="e.g., Take with food"
                                                                            {...field}
                                                                            onChange={(e) => {
                                                                                field.onChange(e);
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                </div>
                                            ))}
                                        </div>

                                        <Separator />

                                        {/* Notes */}
                                        <div className="space-y-3">
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
                                                                placeholder="Additional notes or prescription instructions..."
                                                                rows={3}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                    </div>

                                </div>
                            </ScrollArea>
                            <div className='flex flex-row justify-end mt-4'>
                                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button variant={'save'} type="submit" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Prescription
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

            </SheetContent>
        </Sheet>
    );
}
