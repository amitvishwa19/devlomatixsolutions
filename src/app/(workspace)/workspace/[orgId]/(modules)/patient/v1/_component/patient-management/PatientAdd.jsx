import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useAction } from '@/hooks/use-action'
import { ActionTooltip } from '@/components/global/ActionTooltip'
import { generateUniqueTempEmail } from '@/utils/functions'
import { DatePicker } from '@/components/global/DatePicker'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoIcon, Loader, Save, User } from 'lucide-react'
import { toast } from 'sonner'
import { upsertpatient } from '../../../_action/upsert-patient'

const demographicsSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["male", "female", "other"], { required_error: "Gender is required", }),
    maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional().or(z.literal("")),
    socialIdNumber: z.string().optional(),
    preferredLanguage: z.enum(["english", "spanish", "hindi", "chinese", "arabic"]).optional().or(z.literal("")),
    primaryPhone: z.string().min(8, "Primary phone is required"), emergencyPhone: z.string().optional(),
    email: z.string().email("Enter a valid email address"),
    homeAddress: z.string().optional(),
})


export default function PatientAdd({ isOpen, onClose, onSave }) {
    const [loading, setLoading] = useState(false)


    const form = useForm({
        resolver: zodResolver(demographicsSchema),
        loading,
        defaultValues: {
            fullName: "",
            dateOfBirth: "",
            gender: undefined,
            maritalStatus: "",
            socialIdNumber: "",
            preferredLanguage: "",
            primaryPhone: "",
            emergencyPhone: "",
            email: "",
            homeAddress: "",
        },
    })

    const handleOnCLose = () => {
        onClose()
        form.reset()
    }

    const { execute } = useAction(upsertpatient, {
        onSuccess: (data) => {
            onSave(data.user)
            setLoading(false)
            handleOnCLose()
            toast.success(`New patient ${form.getValues('fullName')} created successfully`)
        },
        onError: (error) => {
            setLoading(false)
            toast.error('Oops! something went wrong, try again later')
        }
    })


    const onFormSubmit = async (data) => {
        console.log('@onFormSubmit', data)
        setLoading(true)
        await execute({ formData: data, type: 'demographic' })
    }


    return (
        <Sheet open={isOpen} onOpenChange={handleOnCLose}>
            <SheetContent className='bg-transparent min-w-[620px] p-2 border-l-0'>
                <div className='h-full bg-card rounded-lg border'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onFormSubmit)}>
                            <div className='flex flex-col '>

                                <SheetHeader >
                                    <SheetTitle>
                                        <div className="flex flex-row items-center gap-2">
                                            <User className="h-5 w-5 text-primary" />
                                            Demographics &amp; Contact
                                        </div>
                                    </SheetTitle>
                                    <SheetDescription className='text-xs text-muted-foreground'>
                                        Create and mange new patient
                                    </SheetDescription>
                                </SheetHeader>

                                <div className='flex flex-col p-4 gap-4'>

                                    {/* Full name + DOB */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs ">
                                                        Full Name *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder='Full name'
                                                            className="bg-background/50 "
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="dateOfBirth"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-xs'>Date Of birth *</FormLabel>
                                                    <FormControl>
                                                        <DatePicker
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            placeholder="Select date of birth"
                                                            className="bg-red-200 hover:bg-transparent"
                                                            disableFutere={true}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Gender + Marital status */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs ">
                                                        Gender *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger className="bg-background/50">
                                                                <SelectValue placeholder="Select" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="male">Male</SelectItem>
                                                                <SelectItem value="female">Female</SelectItem>
                                                                <SelectItem value="other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="maritalStatus"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs ">
                                                        Marital Status
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value || ""}
                                                        >
                                                            <SelectTrigger className="bg-background/50">
                                                                <SelectValue placeholder="Select" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="single">Single</SelectItem>
                                                                <SelectItem value="married">Married</SelectItem>
                                                                <SelectItem value="divorced">Divorced</SelectItem>
                                                                <SelectItem value="widowed">Widowed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Social ID + Language */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="socialIdNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs ">
                                                        Social ID Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="MRN-2024-001"
                                                            className="bg-background/50"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="preferredLanguage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs ">
                                                        Preferred Language
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value || ""}
                                                        >
                                                            <SelectTrigger className="bg-background/50">
                                                                <SelectValue placeholder="Select" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="english">English</SelectItem>
                                                                <SelectItem value="spanish">Spanish</SelectItem>
                                                                <SelectItem value="hindi">Hindi</SelectItem>
                                                                <SelectItem value="chinese">Chinese</SelectItem>
                                                                <SelectItem value="arabic">Arabic</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Contact info */}
                                    <div className="border-t border-border pt-4">
                                        <p className="mb-3 text-sm font-medium">
                                            Contact Information
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="primaryPhone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs ">
                                                            Primary Phone *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                className="bg-background/50"
                                                                placeholder="(91) 9723-123-123"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="emergencyPhone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs ">
                                                            Emergency Phone
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                className="bg-background/50"
                                                                placeholder="(91) 9723-123-123"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="mt-4">
                                                    <FormLabel className="text-xs flex flex-row items-center gap-2">
                                                        Email Address *
                                                        <ActionTooltip label='Dont have email id ? click to generate temperory email id'>
                                                            <InfoIcon size={16} className=' cursor-pointer' onClick={() => {
                                                                form.setValue('email', generateUniqueTempEmail());
                                                                form.watch('email')
                                                            }} />
                                                        </ActionTooltip>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            {...field}
                                                            className="bg-background/50"
                                                            placeholder="patient@email.com"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="homeAddress"
                                            render={({ field }) => (
                                                <FormItem className="mt-4">
                                                    <Label className="text-xs ">
                                                        Home Address
                                                    </Label>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            rows={4}
                                                            className="bg-background/50"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                </div>



                                <SheetFooter className='flex flex-row items-center justify-end'>
                                    <SheetClose asChild>
                                        <Button variant="outline" size='sm' disabled={loading}>
                                            Close
                                        </Button>
                                    </SheetClose>
                                    <Button type="submit" variant='save' size='sm' disabled={loading}>
                                        {loading ? <Loader className='animate-spin' /> : <Save />}
                                        Save changes
                                    </Button>
                                </SheetFooter>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    )
}
