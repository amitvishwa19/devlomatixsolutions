import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Save, User, Phone, Heart, AlertCircle, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { useModal } from "@/hooks/useModal";
import { useAction } from "@/hooks/use-action";
import { managePatient } from "../_action/manage-patient";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { uuid } from "@/utils/functions";
import moment from "moment";
import { useOrg } from "@/providers/OrgProvider";

const patientFormSchema = z.object({
    // Personal Information
    firstName: z.string().trim().min(2, { message: "First name must be at least 2 characters" }).max(50),
    lastName: z.string().trim().min(2, { message: "Last name must be at least 2 characters" }).max(50),
    dob: z.any({ required_error: "Date of birth is required" }),
    gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender" }),
    email: z.string().trim().min(2, { message: "Please enter a email to add new patient" }).max(100),


    // Contact Information
    phone: z.string().trim().min(10, { message: "Phone number must be at least 10 digits" }).max(15),
    address: z.string().trim().min(5, { message: "Address must be at least 5 characters" }).max(200),
    city: z.string().trim().min(2, { message: "City must be at least 2 characters" }).max(50),
    zipCode: z.string().trim().min(3, { message: "Zip code must be at least 3 characters" }).max(10),

    // Emergency Contact
    emergencyContactName: z.optional(z.string().trim()),
    emergencyContactPhone: z.string().trim().optional(),
    emergencyContactRelation: z.string().trim().optional(),

    // Medical Information
    bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], { required_error: "Blood type is required" }),
    allergies: z.string().max(500).optional(),
    medicalHistory: z.string().max(1000).optional(),
});


export default function PatientCrudModal() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState()
    const { isOpen, onOpen, onClose, type: dtype, data: modalData } = useModal();
    const isModalOpen = isOpen && dtype === "patient-crud";
    const { refreshServer } = useOrg()


    const form = useForm({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            dob: "",
            gender: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            zipCode: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            emergencyContactRelation: "",
            bloodType: "",
            allergies: "",
            medicalHistory: "",
        },
    });


    useEffect(() => {
        //console.log(modalData?.user?.medicalProfile)
        form.setValue('firstName', modalData?.user?.medicalProfile?.personal?.firstname)
        form.setValue('lastName', modalData?.user?.medicalProfile?.personal?.lastname)
        form.setValue('dob', modalData?.user?.medicalProfile?.personal?.dob)
        form.setValue('gender', modalData?.user?.medicalProfile?.personal?.gender)
        form.setValue('email', modalData?.user?.email)

        form.setValue('phone', modalData?.user?.medicalProfile?.contact?.basic?.phone)
        form.setValue('address', modalData?.user?.medicalProfile?.contact?.address?.address)
        form.setValue('city', modalData?.user?.medicalProfile?.contact?.address?.city)
        form.setValue('zipCode', modalData?.user?.medicalProfile?.contact?.address?.zip)

        form.setValue('emergencyContactName', modalData?.user?.medicalProfile?.contact?.emergency?.name)
        form.setValue('emergencyContactPhone', modalData?.user?.medicalProfile?.contact?.emergency?.phone)
        form.setValue('emergencyContactRelation', modalData?.user?.medicalProfile?.contact?.emergency?.relation)

        form.setValue('bloodType', modalData?.user?.medicalProfile?.medicalInformation?.bloodGroup)
        form.setValue('allergies', modalData?.user?.medicalProfile?.medicalInformation?.allergies)
        form.setValue('medicalHistory', modalData?.user?.medicalProfile?.medicalInformation?.medicalHistory)


    }, [isOpen, onOpen, form])



    const { execute } = useAction(managePatient, {
        onSuccess: (data) => {

            console.log(data)
            setLoading(false)

            if (data.status === 501) {
                return toast.error("Patient already exists", { id: 'update-patient' })
            }
            handleOpenChange()

            refreshServer().then((e) => {
                if (modalData.type === 'add') {
                    toast.success("New patient added successfully", { id: 'update-patient' })
                } else {
                    toast.success("Patient profile updated successfully", { id: 'update-patient' })
                }
            })



        },
        onError: (error) => {
            setLoading(false)
            console.log(error)
            toast.error("Oops!, Something went wrong, please try again", { id: 'update-patient' })
        }
    })

    function onSubmit(data) {


        setLoading(true)
        if (modalData.type === 'add') {
            toast.loading('Wait !, we are add new patient to server', { id: 'update-patient' })
        } else {
            toast.loading('Wait !, we are updating patient information to server', { id: 'update-patient' })
        }

        const personal = { firstname: data.firstName, lastname: data.lastName, dob: data.dob, gender: data.gender, email: data.email }
        const contact = {
            basic: { phone: data.phone },
            address: { address: data.address, city: data.city, zip: data.zipCode },
            emergency: { name: data.emergencyContactName, phone: data.emergencyContactPhone, relation: data.emergencyContactRelation }
        }
        const medicalInformation = { bloodGroup: data.bloodType, allergies: data.allergies, medicalHistory: data.medicalHistory }
        execute({ userId: session?.user?.userId, personal, contact, medicalInformation, type: modalData.type })

        console.log("Patient data:", { personal, contact, medicalInformation, type: modalData.type });

        // Here you would typically send the data to your backend
    }

    const handleOpenChange = () => {
        form.reset()
        onClose()
    }

    return (

        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <DialogContent className='dark:bg-darkPrimaryBackground min-w-[90%]  min-h-[80vh]  p-2 [&>button:last-child]:hidden overflow-hidden'>

                <DialogHeader className='hidden'>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6  h-full flex flex-col flex-1">

                        <div className="flex-1 grid grid-flow-row grid-cols-3 gap-4">

                            <div className="flex flex-col gap-4 p-4 border rounded-md">
                                <div className="self-center mb-10">
                                    <div className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-primary" />
                                        <CardTitle>Personal Information</CardTitle>
                                    </div>
                                    <CardDescription>Basic patient details and identification</CardDescription>
                                </div>

                                <div className="flex flex-col gap-4">

                                    <FormField control={form.control} name="firstName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />

                                    <FormField control={form.control} name="lastName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />

                                    <FormField control={form.control} name="dob" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of Birth *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline"
                                                            className={cn("w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground")}>
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a
                                                                date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-popover z-50"
                                                    align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus
                                                        className={cn("p-3  nter - events - auto dark:bg-darkPrimaryBackground w-[250px]")}

                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />

                                    <FormField control={form.control} name="gender" render={({ field }) => (
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

                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />

                                </div>
                            </div>

                            <div className="flex flex-col gap-4 p-4 border rounded-md">
                                <div className="self-center mb-10">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-5 w-5 text-medical-teal" />
                                        <CardTitle>Contact Information</CardTitle>
                                    </div>
                                    <CardDescription>How to reach the patient</CardDescription>
                                </div>
                                <div className="flex flex-col gap-4">

                                    <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+91 7712234045" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />

                                    <FormField control={form.control} name="address" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel> Address *</FormLabel>
                                            <FormControl>
                                                <Textarea rows='3'  {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField control={form.control} name="city" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField control={form.control} name="zipCode" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Zip Code *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />

                                    <FormField control={form.control} name="emergencyContactName" render={({ field
                                    }) => (
                                        <FormItem>
                                            <FormLabel>Emergency Contact Name</FormLabel>
                                            <FormControl>
                                                <Input  {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField control={form.control} name="emergencyContactPhone" render={({
                                        field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Phone</FormLabel>
                                            <FormControl>
                                                <Input  {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />

                                    <FormField control={form.control} name="emergencyContactRelation" render={({ field
                                    }) => (
                                        <FormItem>
                                            <FormLabel>Relationship</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Spouse, Parent, Sibling, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 p-4 border rounded-md">
                                <div className="self-center mb-10">
                                    <div className="flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-destructive" />
                                        <CardTitle>Medical Information</CardTitle>
                                    </div>
                                    <CardDescription>Important medical details and history</CardDescription>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <FormField control={form.control} name="bloodType" render={({ field }) => (
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

                                    <FormField control={form.control} name="allergies" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Known Allergies</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="List any known allergies (medications, foods, environmental, etc.)"
                                                    className="resize-none" rows={3} {...field} />
                                            </FormControl>
                                            <FormDescription>Press enter to add the allergy
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />

                                    <FormField control={form.control} name="medicalHistory" render={({ field
                                    }) => (
                                        <FormItem>
                                            <FormLabel>Medical History</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Brief medical history including chronic conditions, past surgeries, current medications, etc."
                                                    className="resize-none" rows={4} {...field} />
                                            </FormControl>
                                            <FormDescription>Include relevant medical conditions and treatments and press enter to add
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                </div>
                            </div>
                        </div>








                        <div className="flex justify-end gap-4 p-4">
                            <Button disabled={loading} variant="ghost" size='sm' onClick={() => handleOpenChange()}>
                                Cancel
                            </Button>
                            <Button disabled={loading} type="submit" variant='save' size='sm' className="">
                                {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {modalData.type === 'add' ? 'Add new Patient' : 'Save Patient Profile'}
                            </Button>
                        </div>
                    </form>
                </Form>

            </DialogContent>
        </Dialog>



    )
}
