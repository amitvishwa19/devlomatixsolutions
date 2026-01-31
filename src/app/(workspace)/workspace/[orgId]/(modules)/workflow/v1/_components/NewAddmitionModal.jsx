import React from 'react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { icons, Workflow } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DynamicIcon } from 'lucide-react/dynamic';


// Your actual workflow stages
export const OPD_WORKFLOW_STEPS = [
    { id: 'registration', name: 'Registration', description: 'Patient check-in and registration', icon: 'clipboard-list', estimatedTime: '5 min' },
    { id: 'triage', name: 'Triage', description: 'Vitals assessment and priority assignment', icon: 'activity', estimatedTime: '10 min' },
    { id: 'waiting', name: 'Waiting', description: 'In queue for consultation', icon: 'hourglass', estimatedTime: 'variable' },
    { id: 'consultation', name: 'Consultation', description: 'Doctor consultation and examination', icon: 'stethoscope', estimatedTime: '15-30 min' },
    { id: 'investigation', name: 'Investigation', description: 'Lab tests and diagnostic imaging', icon: 'test-tube', estimatedTime: '30-60 min' },
    { id: 'pharmacy', name: 'Pharmacy', description: 'Medication dispensing', icon: 'pill', estimatedTime: '10 min' },
    { id: 'follow-up', name: 'Follow-up', description: 'Schedule next appointment', icon: 'calendar-check', estimatedTime: '5 min' },
    { id: 'discharged', name: 'Discharged', description: 'Patient discharged from OPD', icon: 'check-circle-2' },
];

export const IPD_WORKFLOW_STEPS = [
    { id: 'admission-request', name: 'Admission Request', description: 'Request for inpatient admission', icon: 'file-input', estimatedTime: '15 min' },
    { id: 'bed-allocation', name: 'Bed Allocation', description: 'Room and bed assignment', icon: 'bed', estimatedTime: '10 min' },
    { id: 'admitted', name: 'Admitted', description: 'Patient formally admitted', icon: 'door-open', estimatedTime: '20 min' },
    { id: 'initial-assessment', name: 'Initial Assessment', description: 'Complete medical assessment', icon: 'clipboard-check', estimatedTime: '30 min' },
    { id: 'treatment', name: 'Treatment', description: 'Active treatment and care', icon: 'heart-pulse', estimatedTime: '50' },
    { id: 'daily-rounds', name: 'Daily Rounds', description: 'Regular doctor visits and monitoring', icon: 'repeat', estimatedTime: 'Daily' },
    { id: 'discharge-planning', name: 'Discharge Planning', description: 'Prepare for discharge', icon: 'list-checks', estimatedTime: '1-2 hrs' },
    { id: 'discharge-summary', name: 'Discharge Summary', description: 'Complete documentation', icon: 'file-text', estimatedTime: '30 min' },
    { id: 'clearance', name: 'Final Clearance', description: 'Billing and pharmacy clearance', icon: 'badge-check', estimatedTime: '20 min' },
    { id: 'discharged', name: 'Discharged', description: 'Patient discharged from IPD', icon: 'check-circle' },
];

const flowSchema = z.object({
    type: z.enum(['OPD', 'IPD', 'Emergency', 'Transfer']),
    patientId: z.string().min(1, 'Patient required'),
    doctorId: z.string().min(1, 'Doctor required'),
    currentStage: z.string().optional(),
    status: z.string().min(1, 'Status required'),
    department: z.string().min(1, 'Department required'),
    room: z.string().optional(),
    bed: z.string().optional(),
    diagnosis: z.string().optional(),
    appointmentId: z.string().optional(),
    userId: z.string().optional(),
    admissionDate: z.string().min(1, 'Select Date'),
    stageHistory: z.array(z.string()).optional().default([]),
    prescriptionIds: z.array(z.string()).optional().default([]),
    invoiceIds: z.array(z.string()).optional().default([]),
    paymentIds: z.array(z.string()).optional().default([]),
});


const DEPARTMENTS = ['Cardiology', 'Neurology', 'Pediatrics', 'Emergency', 'ICU', 'Surgery', 'Radiology', 'Oncology', 'Orthopedics'];
const STAGES = ['Registration', 'Consultation', 'Diagnosis', 'Admission', 'Treatment', 'Discharge'];
const STATUSES = ['draft', 'active', 'completed', 'cancelled', 'pending'];
const ROOMS = ['Room 101', 'Room 102', 'ICU-1', 'ICU-2', 'Ward A', 'Ward B'];

function WorkflowIcon({ iconName, className }) {
    // FileInput → file-input
    const kebabCase = iconName
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');

    const IconComponent = icons[kebabCase];

    if (!IconComponent) {
        return <div className={`w-5 h-5 bg-muted rounded ${className}`} title={iconName} />;
    }

    return <IconComponent className={className} />;
}

export default function NewAddmitionModal({ isOpen, onClose, mode, patients, doctors }) {


    const form = useForm({
        resolver: zodResolver(flowSchema),
        defaultValues: {
            type: 'OPD',
            patientId: '',
            doctorId: '',
            currentStage: '',
            status: '',
            department: '',
            room: '',
            bed: '',
            diagnosis: '',
            appointmentId: '',
            userId: '',
            admissionDate: '',
            stageHistory: [],
            prescriptionIds: [],
            invoiceIds: [],
            paymentIds: [],
        },
    });

    // Watch flow type to filter stages
    const flowType = useWatch({ control: form.control, name: 'type' });
    const currentStages = flowType === 'OPD' ? OPD_WORKFLOW_STEPS : IPD_WORKFLOW_STEPS;

    const handleSubmit = (data) => {
        console.log('✅ Flow Data:', data);
        //onSubmit?.(data);
        //onOpenChange(false);
    };


    const handleOnCLose = () => {
        onClose()
    }


    return (
        <Sheet open={isOpen} onOpenChange={handleOnCLose}>
            <SheetContent className=' min-w-[620px] border-0 bg-transparent p-2'>
                <div className='bg-card rounded-md h-full p-4'>
                    <SheetHeader>
                        <SheetTitle className='flex flex-row items-center gap-2'>
                            <Workflow className='h-5 w-5 text-sky-500' />
                            Create new Careflow
                        </SheetTitle>
                        <SheetDescription className='text-xs text-muted-foreground'>
                            Elevate Hospital Efficiency: Craft Tailored OPD-IPD Flows That Ensure Seamless Patient Movement, Better Resource Utilization, and Superior Care Coordination
                        </SheetDescription>
                    </SheetHeader>


                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 overflow-y-auto pb-4">



                                {/* Flow Type - Controls Stages */}
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Flow Type *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select flow type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="OPD">🩺 OPD Workflow</SelectItem>
                                                    <SelectItem value="IPD">🏥 IPD Workflow</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 2. ✅ SINGLE STAGE SELECT */}
                                <FormField
                                    control={form.control}
                                    name="currentStage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Stage *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="ring-primary/20">
                                                        <SelectValue placeholder="Select current workflow stage" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="w-[500px]">
                                                    {currentStages.map((stage) => (
                                                        <SelectItem key={stage.id} value={stage.id} className="flex items-center gap-3 ">
                                                            {/* <div className="w-8 h-8 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                                                                {stage.icon}
                                                            </div> */}
                                                            <div className="flex flex-row items-center gap-2">
                                                                <DynamicIcon name={stage.icon} className="h-4 w-4 text-primary" />
                                                                <span className="font-medium">{stage.name}</span>
                                                            </div>

                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Patient, Doctor, Department, Status - Grid Layout */}

                                <FormField
                                    control={form.control}
                                    name="patientId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Patient *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select patient" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {patients?.map((patient) => (
                                                        <SelectItem key={patient.id} value={patient.id}>
                                                            {patient.displayName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="doctorId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Doctor *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select doctor" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {doctors.map((doctor) => (
                                                        <SelectItem key={doctor.id} value={doctor.id}>
                                                            Dr. {doctor.displayName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />



                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select department" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {DEPARTMENTS.map((dept) => (
                                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {STATUSES.map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                                {/* Rest of fields (room, bed, diagnosis, date, relations) - same as before */}
                                {/* ... [Previous code for other fields] ... */}

                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-xl">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-2">Stages Selected</div>
                                        <div className="flex flex-wrap gap-1">
                                            {form.watch('stageHistory')?.map(id => {
                                                const stage = currentStages.find(s => s.id === id);
                                                return stage ? (
                                                    <Badge key={id} variant="outline" className="text-xs">
                                                        {stage.name}
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-2">Relations</div>
                                        <div className="flex flex-wrap gap-1">
                                            {form.watch('prescriptionIds')?.length > 0 && (
                                                <Badge>{form.watch('prescriptionIds').length} Rx</Badge>
                                            )}
                                            {form.watch('invoiceIds')?.length > 0 && (
                                                <Badge>{form.watch('invoiceIds').length} Inv</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Create Flow ({form.watch('stageHistory')?.length || 0} stages)
                                    </Button>
                                </div>


                            </form>
                        </Form>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
