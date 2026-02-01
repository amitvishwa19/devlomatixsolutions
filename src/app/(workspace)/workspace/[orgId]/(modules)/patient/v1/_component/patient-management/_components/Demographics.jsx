
import React, { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileText, Pill, AlertTriangle, Clock, FolderOpen, StickyNote, FileCheck, Heart, Zap, Thermometer, Activity, Scale, User, Shield, Plus, X, Save, Loader, InfoIcon, Pencil, } from "lucide-react";
import { toast } from 'sonner'
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useAction } from '@/hooks/use-action'
import { ActionTooltip } from '@/components/global/ActionTooltip'
import { generateUniqueTempEmail } from '@/utils/functions'
import { DatePicker } from '@/components/global/DatePicker'
import { upsertpatient } from '../../../../_action/upsert-patient';



const demographicsSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["male", "female", "other"], { required_error: "Gender is required", }),
    maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),
    socialIdNumber: z.string().optional(),
    preferredLanguage: z.enum(["english", "spanish", "hindi", "chinese", "arabic"]).optional().or(z.literal("")),
    primaryPhone: z.string().min(8, "Primary phone is required"), emergencyPhone: z.string().optional(),
    email: z.string().email("Enter a valid email address"),
    homeAddress: z.string().optional(),
})


export default function Demographics({ patient, mode, onSave, close }) {
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)

    const form = useForm({
        resolver: zodResolver(demographicsSchema),
        defaultValues: {
            fullName: "",
            dateOfBirth: "",
            gender: "",
            maritalStatus: "",
            socialIdNumber: "",
            preferredLanguage: "",
            primaryPhone: "",
            emergencyPhone: "",
            email: "",
            homeAddress: "",
        },
    })

    console.log(patient)

    useEffect(() => {
        setEditing(false)

        if (patient) {
            form.reset({
                fullName: patient?.user?.demographic?.fullName || '',
                dateOfBirth: new Date(patient?.user?.demographic?.dateOfBirth) || '',
                gender: patient?.user?.demographic?.gender || '',
                maritalStatus: patient?.user?.demographic?.maritalStatus || '',
                socialIdNumber: patient?.user?.demographic?.socialIdNumber || '',
                preferredLanguage: patient?.user?.demographic?.preferredLanguage || '',
                primaryPhone: patient?.user?.demographic?.primaryPhone || '',
                emergencyPhone: patient?.user?.demographic?.emergencyPhone || '',
                email: patient?.user?.demographic?.email || '',
                homeAddress: patient?.user?.demographic?.homeAddress || '',
            })
        } else {
            form.reset({
                fullName: "",
                dateOfBirth: "",
                gender: "",
                maritalStatus: "",
                socialIdNumber: "",
                preferredLanguage: "",
                primaryPhone: "",
                emergencyPhone: "",
                email: "",
                homeAddress: "",
            })
        }


        const debugValues = form.watch();
        console.log('🔍 LIVE FORM:', debugValues);

    }, [close, form, mode, patient])

    const genderValue = form.watch('gender');
    const maritalValue = form.watch('maritalStatus');


    const { execute } = useAction(upsertpatient, {
        onSuccess: (data) => {
            onSave(data.user)
            setLoading(false)
            setEditing(false)
            toast.success(`${data.mode === 'add' ? 'New patient created' : 'Patient updated'} successfully`)
        },
        onError: (error) => {
            setLoading(null)
            toast.error('Oops! something went wrong, try again later')
        }
    })


    const onFormSubmit = async (data, type) => {
        console.log('@onFormSubmit', data, type)
        await execute({ formData: data, type: type })
    }


    return (
        <Card className="bg-card/50 border-border" >
            <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => {
                    setLoading('demographic')
                    onFormSubmit(data, 'demographic')
                })}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex flex-row items-center justify-between gap-2 text-base">
                            <div className="flex flex-row items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Demographics &amp; Contact
                            </div>

                            {editing ? (
                                <button type="submit" disabled={loading === 'demographic' && true}>
                                    {
                                        loading ? <Loader className="h-5 w-5 animate-spin text-sky-500" /> : <Save className="h-5 w-5 cursor-pointer text-sky-500" />
                                    }
                                </button>
                            ) : <Pencil className="h-5 w-5 cursor-pointer text-sky-500" onClick={setEditing} />}

                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">

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
                                                disabled={!editing}
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
                                                className="bg-background/50"
                                                disableFutere={true}
                                                disabled={!editing}
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
                                                value={field.value}
                                                onValueChange={field.onChange}

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
                                                value={field.value || undefined}
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
                                                disabled={!editing}
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
                                                disabled={!editing}
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
                                                    disabled={!editing}
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
                                                    disabled={!editing}
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
                                                <InfoIcon size={16} disabled={!editing} className=' cursor-pointer' onClick={() => {
                                                    if (editing) {
                                                        form.setValue('email', generateUniqueTempEmail());
                                                        form.watch('email')
                                                    }
                                                }} />
                                            </ActionTooltip>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                {...field}
                                                disabled={!editing}
                                                className="bg-background/50"
                                                placeholder="patient@email.com"
                                                readOnly={true}

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
                                                rows={2}
                                                disabled={!editing}
                                                className="bg-background/50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </form>
            </Form>
        </Card>
    )
}
