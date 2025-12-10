import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Save, User, Phone, Heart, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const patientFormSchema = z.object({
    // Personal Information
    firstName: z.string().trim().min(2, { message: "First name must be at least 2 characters" }).max(50),
    lastName: z.string().trim().min(2, { message: "Last name must be at least 2 characters" }).max(50),
    dateOfBirth: z.date({ required_error: "Date of birth is required" }),
    gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender" }),

    // Contact Information
    email: z.string().trim().email({ message: "Invalid email address" }).max(100),
    phone: z.string().trim().min(10, { message: "Phone number must be at least 10 digits" }).max(15),
    address: z.string().trim().min(5, { message: "Address must be at least 5 characters" }).max(200),
    city: z.string().trim().min(2, { message: "City must be at least 2 characters" }).max(50),
    zipCode: z.string().trim().min(3, { message: "Zip code must be at least 3 characters" }).max(10),

    // Emergency Contact
    emergencyContactName: z.string().trim().min(2, { message: "Emergency contact name is required" }).max(50),
    emergencyContactPhone: z.string().trim().min(10, { message: "Emergency contact phone is required" }).max(15),
    emergencyContactRelation: z.string().trim().min(2, { message: "Relationship is required" }).max(30),

    // Medical Information
    bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], { required_error: "Blood type is required" }),
    allergies: z.string().max(500).optional(),
    medicalHistory: z.string().max(1000).optional(),
});



export function PatientProfileForm() {
    const form = useForm < PatientFormValues > ({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            zipCode: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            emergencyContactRelation: "",
            allergies: "",
            medicalHistory: "",
        },
    });

    function onSubmit(data) {
        console.log("Patient data:", data);
        toast({
            title: "Patient Profile Saved",
            description: `Profile for ${data.firstName} ${data.lastName} has been successfully saved.`,
            className: "bg-success text-white",
        });
        // Here you would typically send the data to your backend
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">Patient Profile</h1>
                <p className="text-muted-foreground">Enter patient information to create a new profile</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <Card className="border-l-4 border-l-primary">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <CardTitle>Personal Information</CardTitle>
                            </div>
                            <CardDescription>Basic patient details and identification</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of Birth *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        initialFocus
                                                        className={cn("p-3 pointer-events-auto")}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-popover z-50">
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="border-l-4 border-l-medical-teal">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-medical-teal" />
                                <CardTitle>Contact Information</CardTitle>
                            </div>
                            <CardDescription>How to reach the patient</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address *</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="john.doe@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 (555) 123-4567" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street Address *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Main Street" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="New York" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="zipCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Zip Code *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="10001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card className="border-l-4 border-l-warning">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-warning" />
                                <CardTitle>Emergency Contact</CardTitle>
                            </div>
                            <CardDescription>Person to contact in case of emergency</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="emergencyContactName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Jane Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="emergencyContactPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Phone *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 (555) 987-6543" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="emergencyContactRelation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Relationship *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Spouse, Parent, Sibling, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Medical Information */}
                    <Card className="border-l-4 border-l-destructive">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-destructive" />
                                <CardTitle>Medical Information</CardTitle>
                            </div>
                            <CardDescription>Important medical details and history</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="bloodType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Blood Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select blood type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-popover z-50">
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="allergies"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Known Allergies</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="List any known allergies (medications, foods, environmental, etc.)"
                                                className="resize-none"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Separate multiple allergies with commas</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="medicalHistory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medical History</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Brief medical history including chronic conditions, past surgeries, current medications, etc."
                                                className="resize-none"
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Include relevant medical conditions and treatments</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => form.reset()}>
                            Reset Form
                        </Button>
                        <Button type="submit" className="min-w-[150px]">
                            <Save className="mr-2 h-4 w-4" />
                            Save Patient Profile
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}