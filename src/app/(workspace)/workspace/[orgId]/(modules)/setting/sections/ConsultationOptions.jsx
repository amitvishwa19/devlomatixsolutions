import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Stethoscope, DollarSign, Clock, Settings, Building2, Video, MessageCircle, Phone, Calendar, Minus, Plus } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";
import { useAppSettings } from "@/app/(workspace)/workspace/_provider/WorkspaceProvider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAction } from "@/hooks/use-action";
import { upsertGeneralSetting } from "../_actions";
import { useSession } from "next-auth/react";

const ConsultationSettingsSchema = z.object({
    consultationOpen: z.boolean(),
    slotTime: z.number().min(5, "Minimum slot time is 5 minutes").max(60, "Maximum slot time is 60 minutes"),
    autoConfirmAppointments: z.boolean(),
    maxAppointmentsPerDay: z.number().min(10, "Minimum 10 appointments").max(200, "Maximum 200 appointments"),
    advanceBookingDays: z.number().min(1, "Minimum 1 day").max(90, "Maximum 90 days"),
    cancellationHours: z.number().min(1, "Minimum 1 hour").max(72, "Maximum 72 hours"),
    timeSlots: z.array(z.object({
        id: z.string(),
        label: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        enabled: z.boolean(),
    })),
    consultationTypes: z.array(z.object({
        id: z.string(),
        label: z.string(),
        price: z.number().min(0, "Price must be positive"),
        enabled: z.boolean(),
    })),
});

const getIconForType = (id) => {
    switch (id) {
        case "clinic": return <Building2 className="h-4 w-4" />;
        case "video": return <Video className="h-4 w-4" />;
        case "chat": return <MessageCircle className="h-4 w-4" />;
        case "phone": return <Phone className="h-4 w-4" />;
        default: return <Building2 className="h-4 w-4" />;
    }
};

const defaultValues = {
    consultationOpen: true,
    slotTime: 10,
    autoConfirmAppointments: false,
    maxAppointmentsPerDay: 50,
    advanceBookingDays: 30,
    cancellationHours: 24,
    timeSlots: [
        { id: "morning", label: "Morning", startTime: "09:00 AM", endTime: "01:00 PM", enabled: false },
        { id: "noon", label: "Noon", startTime: "01:00 PM", endTime: "05:00 PM", enabled: false },
        { id: "evening", label: "Evening", startTime: "05:30 PM", endTime: "09:30 PM", enabled: false },
        { id: "night", label: "Night", startTime: "00:00 AM", endTime: "03:00 AM", enabled: false },
    ],
    consultationTypes: [
        { id: "clinic", label: "clinic", price: 250, enabled: false },
        { id: "video", label: "video", price: 150, enabled: false },
        { id: "chat", label: "chat", price: 150, enabled: false },
        { id: "phone", label: "phone", price: 150, enabled: false },
    ],
};

export function ConsultationOptions() {
    const appSettings = useAppSettings()
    const { data: session } = useSession()
    const [loading, setLoading] = useState()

    const form = useForm({
        resolver: zodResolver(ConsultationSettingsSchema),
        defaultValues: {
            consultationOpen: true,
            slotTime: 10,
            autoConfirmAppointments: false,
            maxAppointmentsPerDay: 50,
            advanceBookingDays: 30,
            cancellationHours: 24,
            timeSlots: [
                { id: "morning", label: "Morning", startTime: "09:00 AM", endTime: "01:00 PM", enabled: false },
                { id: "noon", label: "Noon", startTime: "01:00 PM", endTime: "05:00 PM", enabled: false },
                { id: "evening", label: "Evening", startTime: "05:30 PM", endTime: "09:30 PM", enabled: false },
                { id: "night", label: "Night", startTime: "00:00 AM", endTime: "03:00 AM", enabled: false },
            ],
            consultationTypes: [
                { id: "clinic", label: "clinic", price: 250, enabled: false },
                { id: "video", label: "video", price: 150, enabled: false },
                { id: "chat", label: "chat", price: 150, enabled: false },
                { id: "phone", label: "phone", price: 150, enabled: false },
            ],
        },
    });

    useEffect(() => {
        if (appSettings?.consultation) {
            form.reset(appSettings.consultation);
        } else {
            form.reset(defaultValues);
        }
    }, [appSettings, form]);

    const handleSlotTimeChange = (delta) => {
        const currentValue = form.getValues("slotTime");
        form.setValue("slotTime", Math.max(5, Math.min(60, currentValue + delta)));
    };

    const handleNumberChange = (field, delta, min, max) => {
        const currentValue = form.getValues(field);
        form.setValue(field, Math.max(min, Math.min(max, currentValue + delta)));
    };

    const { execute } = useAction(upsertGeneralSetting, {
        onSuccess: (data) => {
            setLoading(false)
            toast.success('Consultation settings saved successfully', { id: 'consultation' })
        },
        onError: (error) => {
            console.log(error)
            setLoading(false)
            toast.error('Oops somethig went wrong ! try again later', { id: 'consultation' })
            setLoading(false);
        }
    })


    const onSubmit = async (data) => {
        console.log(data)
        try {
            setLoading(true)
            toast.loading("Saving Consultation settings...", { id: 'consultation' });
            await execute({ userId: session.user.userId, type: 'consultation', payload: data })

        } catch (error) {
            toast.error("Failed to save settings", { id: 'consultation' });
        }
    };

    // Load data from appSettings.consultation when available


    return (
        <div className="flex flex-col h-full">
            <SectionHeader
                title="Consultation Options"
                description="Connect with Trusted Doctors When You Need Them."
                onSave={form.handleSubmit(onSubmit)}
                isSaving={loading}
            />

            <ScrollArea className="flex-1  h-[50vh] p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>


                        {/* Consultation Open Toggle */}
                        <FormField
                            control={form.control}
                            name="consultationOpen"
                            render={({ field }) => (
                                <FormItem className="mb-8 flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">Consultation Open</span>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Consultation Slot Time */}
                        <FormField
                            control={form.control}
                            name="slotTime"
                            render={({ field }) => (
                                <FormItem className="mb-8 flex items-center gap-4">
                                    <span className="min-w-[160px] text-sm font-medium text-foreground">
                                        Consultation Slot time
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="stepper"
                                            size="icon"
                                            onClick={() => handleSlotTimeChange(-5)}
                                            className="h-9 w-9"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                value={field.value}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                className="w-20 text-center"
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="stepper"
                                            size="icon"
                                            onClick={() => handleSlotTimeChange(5)}
                                            className="h-9 w-9"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Hospital Timings */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-sm font-semibold text-foreground">Hospital Timings</h2>
                            <div className="space-y-4">
                                {form.watch("timeSlots").map((slot, index) => (
                                    <FormField
                                        key={slot.id}
                                        control={form.control}
                                        name={`timeSlots.${index}.enabled`}
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-4">
                                                <span className="min-w-[80px] text-sm text-muted-foreground">{slot.label}</span>
                                                <Input
                                                    type="text"
                                                    value={slot.startTime}
                                                    readOnly
                                                    className="w-28 text-center"
                                                />
                                                <span className="text-muted-foreground">-</span>
                                                <Input
                                                    type="text"
                                                    value={slot.endTime}
                                                    readOnly
                                                    className="w-28 text-center"
                                                />
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Consultations Type */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-sm font-semibold text-foreground">Consultations Type</h2>
                            <div className="space-y-4">
                                {form.watch("consultationTypes").map((type, index) => (
                                    <div key={type.id} className="flex items-center gap-4">
                                        <div className="flex min-w-[100px] items-center gap-2 rounded-md bg-secondary px-3 py-2">
                                            {getIconForType(type.id)}
                                            <span className="text-sm text-secondary-foreground">{type.label}</span>
                                        </div>
                                        <span className="text-muted-foreground">₹</span>
                                        <FormField
                                            control={form.control}
                                            name={`consultationTypes.${index}.price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            value={field.value}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                            className="w-24 text-center"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`consultationTypes.${index}.enabled`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Appointment Rules */}
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <h2 className="text-sm font-semibold text-foreground">Appointment Rules</h2>
                            </div>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="autoConfirmAppointments"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Auto-confirm Appointments</span>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="maxAppointmentsPerDay"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-4">
                                            <span className="min-w-[180px] text-sm text-muted-foreground">Max Appointments/Day</span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="stepper"
                                                    size="icon"
                                                    onClick={() => handleNumberChange("maxAppointmentsPerDay", -5, 10, 200)}
                                                    className="h-8 w-8"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        value={field.value}
                                                        readOnly
                                                        className="w-20 text-center"
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="stepper"
                                                    size="icon"
                                                    onClick={() => handleNumberChange("maxAppointmentsPerDay", 5, 10, 200)}
                                                    className="h-8 w-8"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="advanceBookingDays"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-4">
                                            <span className="min-w-[180px] text-sm text-muted-foreground">Advance Booking (days)</span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="stepper"
                                                    size="icon"
                                                    onClick={() => handleNumberChange("advanceBookingDays", -1, 1, 90)}
                                                    className="h-8 w-8"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        value={field.value}
                                                        readOnly
                                                        className="w-20 text-center"
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="stepper"
                                                    size="icon"
                                                    onClick={() => handleNumberChange("advanceBookingDays", 1, 1, 90)}
                                                    className="h-8 w-8"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cancellationHours"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-4">
                                            <span className="min-w-[180px] text-sm text-muted-foreground">Cancellation Notice (hrs)</span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="stepper"
                                                    size="icon"
                                                    onClick={() => handleNumberChange("cancellationHours", -1, 1, 72)}
                                                    className="h-8 w-8"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        value={field.value}
                                                        readOnly
                                                        className="w-20 text-center"
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="stepper"
                                                    size="icon"
                                                    onClick={() => handleNumberChange("cancellationHours", 1, 1, 72)}
                                                    className="h-8 w-8"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                    </form>
                </Form>
            </ScrollArea>
        </div>
    );
}
