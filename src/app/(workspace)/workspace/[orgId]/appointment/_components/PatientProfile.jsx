import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DatePicker } from "@/components/global/DatePicker";


const patientSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.string().optional(),
    phone: z.string().trim().max(20).optional(),
    email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
    address: z.string().trim().max(500).optional(),
    emergencyContactName: z.string().trim().max(100).optional(),
    emergencyContactPhone: z.string().trim().max(20).optional(),
    emergencyContactRelationship: z.string().trim().max(50).optional(),
    bloodType: z.string().optional(),
    allergies: z.string().trim().max(1000).optional(),
    currentMedications: z.string().trim().max(1000).optional(),
    medicalHistory: z.string().trim().max(2000).optional(),
});

export default function PatientProfile() {
    const [isSubmitting, setIsSubmitting] = useState(false);


    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        resolver: zodResolver(patientSchema),
    });

    const onSubmit = async (data) => { }


    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* Personal Information */}
                <div className="p-2">
                    <h3 className="text-md font-semibold text-foreground  pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                {...register("firstName")}
                                className={errors.firstName ? "border-destructive" : ""}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-destructive">{errors.firstName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                {...register("lastName")}
                                className={errors.lastName ? "border-destructive" : ""}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-destructive">{errors.lastName.message}</p>
                            )}
                        </div>




                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                            <div className='flex flex-row gap-2'>
                                <Input
                                    type="text"
                                    disabled
                                    //value={moment(appointmentData.date).format('Do MMM YY')}
                                    {...register("dateOfBirth")}
                                    onChange={() => { }}
                                />

                                <div className='flex rounded-md mt-1'>
                                    <DatePicker
                                        onChange={(e) => {

                                            setAppointmentData({ ...appointmentData, date: e })
                                        }} />
                                </div>
                            </div>
                            {errors.dateOfBirth && (
                                <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select onValueChange={(value) => setValue("gender", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" type="tel" {...register("phone")} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                className={errors.email ? "border-destructive" : ""}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" {...register("address")} rows={2} />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                    <h3 className="text-md font-semibold text-foreground  pb-2">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContactName">Contact Name</Label>
                            <Input id="emergencyContactName" {...register("emergencyContactName")} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                            <Input id="emergencyContactPhone" type="tel" {...register("emergencyContactPhone")} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                            <Input id="emergencyContactRelationship" {...register("emergencyContactRelationship")} />
                        </div>
                    </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                    <h3 className="text-md font-semibold text-foreground  pb-2">Medical Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bloodType">Blood Type</Label>
                            <Select onValueChange={(value) => setValue("bloodType", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select blood type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="allergies">Allergies</Label>
                            <Textarea id="allergies" {...register("allergies")} rows={2} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="currentMedications">Current Medications</Label>
                            <Textarea id="currentMedications" {...register("currentMedications")} rows={3} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="medicalHistory">Medical History</Label>
                            <Textarea id="medicalHistory" {...register("medicalHistory")} rows={4} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Patient Profile"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
