'use client'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileText, Pill, AlertTriangle, Clock, FolderOpen, StickyNote, FileCheck, Heart, Zap, Thermometer, Activity, Scale, User, Shield, Plus, X, Save, Loader, InfoIcon, } from "lucide-react";
import { toast } from 'sonner'


import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { upsertpatient } from '../../_action/upsert-patient'
import { useAction } from '@/hooks/use-action'
import { ActionTooltip } from '@/components/global/ActionTooltip'
import { generateUniqueTempEmail } from '@/utils/functions'



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




export default function PatientEditor({ patient, isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [patientdata, setPatientData] = useState(null)
    const [loading, setLoading] = useState(null)
    const [tempEmail, setTempEmail] = useState('');
    const [generateEmail, setGenerateEmail] = useState(false);


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




    const [vitalSigns, setVitalSigns] = useState({
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        weight: "",
    });

    const [demographics, setDemographics] = useState({
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
    });

    const [insurance, setInsurance] = useState({
        provider: "",
        planType: "",
        policyNumber: "",
        groupNumber: "",
        effectiveDate: "",
        expirationDate: "",
        copay: "",
        deductible: "",
        outOfPocketMax: "",
        subscriberName: "",
        relationshipToPatient: "",
        subscriberDob: "",
        subscriberId: "",
    });

    const [medicalHistory, setMedicalHistory] = useState({
        conditions: [],
        surgeries: [],
        familyHistory: "",
    });

    const [medications, setMedications] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [notes, setNotes] = useState("");

    const [newCondition, setNewCondition] = useState("");
    const [newSurgery, setNewSurgery] = useState("");
    const [newMedication, setNewMedication] = useState({
        name: "",
        dosage: "",
        frequency: "",
        startDate: "",
    });
    const [newAllergy, setNewAllergy] = useState({
        allergen: "",
        severity: "",
        reaction: "",
    });

    const handleSave = () => {
        if (!demographics.fullName.trim()) {
            toast.error("Please enter patient name");
            return;
        }

        const nameParts = demographics.fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const patient = {
            id: `PAT-${Date.now()}`,
            firstName,
            lastName,
            email: demographics.email || undefined,
            phone: demographics.primaryPhone || undefined,
            dateOfBirth: demographics.dateOfBirth || undefined,
            address: demographics.homeAddress || undefined,
            insuranceId: insurance.policyNumber || undefined,
            createdAt: new Date().toISOString(),
        };


        toast.success("Patient added successfully!");
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setVitalSigns({
            bloodPressure: "",
            heartRate: "",
            temperature: "",
            oxygenSaturation: "",
            weight: "",
        });
        setDemographics({
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
        });
        setInsurance({
            provider: "",
            planType: "",
            policyNumber: "",
            groupNumber: "",
            effectiveDate: "",
            expirationDate: "",
            copay: "",
            deductible: "",
            outOfPocketMax: "",
            subscriberName: "",
            relationshipToPatient: "",
            subscriberDob: "",
            subscriberId: "",
        });
        setMedicalHistory({
            conditions: [],
            surgeries: [],
            familyHistory: "",
        });
        setMedications([]);
        setAllergies([]);
        setNotes("");
        setActiveTab("overview");
    };

    const addCondition = () => {
        if (newCondition.trim()) {
            setMedicalHistory(prev => ({
                ...prev,
                conditions: [...prev.conditions, newCondition.trim()]
            }));
            setNewCondition("");
        }
    };

    const addSurgery = () => {
        if (newSurgery.trim()) {
            setMedicalHistory(prev => ({
                ...prev,
                surgeries: [...prev.surgeries, newSurgery.trim()]
            }));
            setNewSurgery("");
        }
    };

    const addMedication = () => {
        if (newMedication.name.trim()) {
            setMedications(prev => [...prev, { ...newMedication }]);
            setNewMedication({ name: "", dosage: "", frequency: "", startDate: "" });
        }
    };

    const addAllergy = () => {
        if (newAllergy.allergen.trim()) {
            setAllergies(prev => [...prev, { ...newAllergy }]);
            setNewAllergy({ allergen: "", severity: "", reaction: "" });
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: Eye },
        { id: "medical-history", label: "Medical History", icon: FileText },
        { id: "medications", label: "Medications", icon: Pill },
        { id: "allergies", label: "Allergies", icon: AlertTriangle },
        { id: "visit-history", label: "Visit History", icon: Clock },
        { id: "documents", label: "Documents", icon: FolderOpen },
        { id: "notes", label: "Notes", icon: StickyNote },
        { id: "prescription", label: "Prescription", icon: FileCheck },
    ];

    const handleOnOpenclose = () => {
        setLoading(null)
        form.reset()
        setActiveTab('overview')
        onClose()
    }


    const { execute } = useAction(upsertpatient, {
        onSuccess: (data) => {
            console.log('@server action data', data)
            setLoading(null)
            toast.success(`${data.mode === 'add' ? 'New patient created' : 'Patient updated'} successfully`)
        },
        onError: (error) => {
            setLoading(null)
            toast.error('Oops! something went wrong, try again later')
        }
    })

    useEffect(() => {
        if (generateEmail && form.watch('phone')) {
            generateUniqueTempEmail().then(email => {
                setTempEmail(email);
                form.setValue('email', email); // ✅ Sets form field value
            });
        }
    }, [generateEmail, form.watch('phone')]);

    const onDemographicSubmit = async (data, type) => {
        setLoading('demographic')
        await execute({ formData: data, type: type })
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOnOpenclose}>
            <form>

                <DialogContent className="bg-card min-w-[90%] max-w-[90%] min-h-[90%] max-h-[90%] [&>button:last-child]:hidden">

                    <DialogHeader className={'hidden'}>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>

                    <div className='absolute inset-0 flex flex-col gap-2'>

                        <div className="bg-card  rounded-md flex-1 h-full overflow-hidden">
                            <ScrollArea className='h-[84vh] w-full overflow-hidden p-2' >

                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">


                                    <TabsList className="w-full flex flex-row items-center justify-between rounded-md mt-2">
                                        {tabs.map((tab) => (
                                            <TabsTrigger
                                                key={tab.id}
                                                value={tab.id}
                                                className="flex items-center gap-2 px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-foreground rounded-md transition-all"
                                            >
                                                <tab.icon className="h-4 w-4" />
                                                <span className="hidden sm:inline">{tab.label}</span>
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <div className="mt-4  pr-2">
                                        {/* Overview Tab */}
                                        <TabsContent value="overview" className="space-y-4">


                                            {/* Vital Signs */}
                                            <Card className="bg-card/50 border-border">
                                                <CardHeader className="pb-0">
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <Activity className="h-5 w-5 text-primary" />
                                                        Vital Signs
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Heart className="h-4 w-4 text-red-400" />
                                                                <span className="text-sm font-medium">Blood Pressure</span>
                                                            </div>
                                                            <Input
                                                                placeholder="120/80"
                                                                value={vitalSigns.bloodPressure}
                                                                onChange={(e) => setVitalSigns(prev => ({ ...prev, bloodPressure: e.target.value }))}
                                                                className="bg-background/50"
                                                            />
                                                            <p className="text-xs text-muted-foreground mt-1">mmHg | Normal: 90-120 mmHg</p>
                                                        </div>
                                                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Zap className="h-4 w-4 text-yellow-400" />
                                                                <span className="text-sm font-medium">Heart Rate</span>
                                                            </div>
                                                            <Input
                                                                placeholder="72"
                                                                value={vitalSigns.heartRate}
                                                                onChange={(e) => setVitalSigns(prev => ({ ...prev, heartRate: e.target.value }))}
                                                                className="bg-background/50"
                                                            />
                                                            <p className="text-xs text-muted-foreground mt-1">bpm | Normal: 60-100 bpm</p>
                                                        </div>
                                                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Thermometer className="h-4 w-4 text-orange-400" />
                                                                <span className="text-sm font-medium">Temperature</span>
                                                            </div>
                                                            <Input
                                                                placeholder="98.6"
                                                                value={vitalSigns.temperature}
                                                                onChange={(e) => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
                                                                className="bg-background/50"
                                                            />
                                                            <p className="text-xs text-muted-foreground mt-1">°F | Normal: 97-99 °F</p>
                                                        </div>
                                                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Activity className="h-4 w-4 text-green-400" />
                                                                <span className="text-sm font-medium">Oxygen Saturation</span>
                                                            </div>
                                                            <Input
                                                                placeholder="98"
                                                                value={vitalSigns.oxygenSaturation}
                                                                onChange={(e) => setVitalSigns(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                                                                className="bg-background/50"
                                                            />
                                                            <p className="text-xs text-muted-foreground mt-1">% | Normal: 95-100 %</p>
                                                        </div>
                                                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Scale className="h-4 w-4 text-blue-400" />
                                                                <span className="text-sm font-medium">Weight</span>
                                                            </div>
                                                            <Input
                                                                placeholder="150"
                                                                value={vitalSigns.weight}
                                                                onChange={(e) => setVitalSigns(prev => ({ ...prev, weight: e.target.value }))}
                                                                className="bg-background/50"
                                                            />
                                                            <p className="text-xs text-muted-foreground mt-1">lbs</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>


                                            <div className="grid md:grid-cols-2 gap-4">


                                                {/* Demographics & Contact */}
                                                <Card className="bg-card/50 border-border">
                                                    <Form {...form}>
                                                        <form onSubmit={form.handleSubmit((data) => {
                                                            onDemographicSubmit(data, 'demographic')
                                                        })}>
                                                            <CardHeader className="pb-3">
                                                                <CardTitle className="flex flex-row items-center justify-between gap-2 text-base">
                                                                    <div className="flex flex-row items-center gap-2">
                                                                        <User className="h-5 w-5 text-primary" />
                                                                        Demographics &amp; Contact
                                                                    </div>
                                                                    <button type="submit" disabled={loading === 'demographic' && true}>
                                                                        {
                                                                            loading === 'demographic' ? <Loader className="h-5 w-5 animate-spin text-sky-500" /> : <Save className="h-5 w-5 cursor-pointer text-sky-500" />
                                                                        }
                                                                    </button>
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
                                                                                        className="bg-background/50"
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
                                                                                <FormLabel className="text-xs ">
                                                                                    Date of Birth *
                                                                                </FormLabel>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="date"
                                                                                        {...field}
                                                                                        className="bg-background/50"
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
                                                                                        readOnly={!!tempEmail}
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

                                                {/* Insurance Information */}
                                                <Card className="bg-card/50 border-border">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="flex items-center gap-2 text-base">
                                                            <Shield className="h-5 w-5 text-primary" />
                                                            Insurance Information
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-muted-foreground text-xs">Insurance Provider</Label>
                                                                <Input
                                                                    value={insurance.provider}
                                                                    onChange={(e) => setInsurance(prev => ({ ...prev, provider: e.target.value }))}
                                                                    className="bg-background/50"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-muted-foreground text-xs">Plan Type</Label>
                                                                <Select
                                                                    value={insurance.planType}
                                                                    onValueChange={(value) => setInsurance(prev => ({ ...prev, planType: value }))}
                                                                >
                                                                    <SelectTrigger className="bg-background/50">
                                                                        <SelectValue placeholder="Select" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="hmo">HMO</SelectItem>
                                                                        <SelectItem value="ppo">PPO</SelectItem>
                                                                        <SelectItem value="epo">EPO</SelectItem>
                                                                        <SelectItem value="pos">POS</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-muted-foreground text-xs">Policy Number</Label>
                                                                <Input
                                                                    value={insurance.policyNumber}
                                                                    onChange={(e) => setInsurance(prev => ({ ...prev, policyNumber: e.target.value }))}
                                                                    className="bg-background/50"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-muted-foreground text-xs">Group Number</Label>
                                                                <Input
                                                                    value={insurance.groupNumber}
                                                                    onChange={(e) => setInsurance(prev => ({ ...prev, groupNumber: e.target.value }))}
                                                                    className="bg-background/50"
                                                                    placeholder="GRP-456789"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-muted-foreground text-xs">Effective Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={insurance.effectiveDate}
                                                                    onChange={(e) => setInsurance(prev => ({ ...prev, effectiveDate: e.target.value }))}
                                                                    className="bg-background/50"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-muted-foreground text-xs">Expiration Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={insurance.expirationDate}
                                                                    onChange={(e) => setInsurance(prev => ({ ...prev, expirationDate: e.target.value }))}
                                                                    className="bg-background/50"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="border-t border-border pt-4">
                                                            <p className="text-sm font-medium mb-3">Coverage Details</p>
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-muted-foreground text-xs">Copay</Label>
                                                                    <Input
                                                                        value={insurance.copay}
                                                                        onChange={(e) => setInsurance(prev => ({ ...prev, copay: e.target.value }))}
                                                                        className="bg-background/50"
                                                                        placeholder="$25"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-muted-foreground text-xs">Deductible</Label>
                                                                    <Input
                                                                        value={insurance.deductible}
                                                                        onChange={(e) => setInsurance(prev => ({ ...prev, deductible: e.target.value }))}
                                                                        className="bg-background/50"
                                                                        placeholder="$1,500"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-muted-foreground text-xs">Out-of-Pocket Max</Label>
                                                                    <Input
                                                                        value={insurance.outOfPocketMax}
                                                                        onChange={(e) => setInsurance(prev => ({ ...prev, outOfPocketMax: e.target.value }))}
                                                                        className="bg-background/50"
                                                                        placeholder="$5,000"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="border-t border-border pt-4">
                                                            <p className="text-sm font-medium mb-3">Subscriber Information</p>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-muted-foreground text-xs">Subscriber Name</Label>
                                                                    <Input
                                                                        value={insurance.subscriberName}
                                                                        onChange={(e) => setInsurance(prev => ({ ...prev, subscriberName: e.target.value }))}
                                                                        className="bg-background/50"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-muted-foreground text-xs">Relationship to Patient</Label>
                                                                    <Select
                                                                        value={insurance.relationshipToPatient}
                                                                        onValueChange={(value) => setInsurance(prev => ({ ...prev, relationshipToPatient: value }))}
                                                                    >
                                                                        <SelectTrigger className="bg-background/50">
                                                                            <SelectValue placeholder="Select" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="self">Self</SelectItem>
                                                                            <SelectItem value="spouse">Spouse</SelectItem>
                                                                            <SelectItem value="child">Child</SelectItem>
                                                                            <SelectItem value="parent">Parent</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-muted-foreground text-xs">Subscriber DOB</Label>
                                                                    <Input
                                                                        type="date"
                                                                        value={insurance.subscriberDob}
                                                                        onChange={(e) => setInsurance(prev => ({ ...prev, subscriberDob: e.target.value }))}
                                                                        className="bg-background/50"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-muted-foreground text-xs">Subscriber ID</Label>
                                                                    <Input
                                                                        value={insurance.subscriberId}
                                                                        onChange={(e) => setInsurance(prev => ({ ...prev, subscriberId: e.target.value }))}
                                                                        className="bg-background/50"
                                                                        placeholder="SUB-789456123"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>

                                        {/* Medical History Tab */}
                                        <TabsContent value="medical-history" className="space-y-6">
                                            <Card className="bg-card/50 border-border">
                                                <CardHeader>
                                                    <CardTitle className="text-base">Past Medical Conditions</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Add condition (e.g., Diabetes, Hypertension)"
                                                            value={newCondition}
                                                            onChange={(e) => setNewCondition(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                                                            className="bg-background/50"
                                                        />
                                                        <Button onClick={addCondition} size="icon" variant="secondary">
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {medicalHistory.conditions.map((condition, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                                            >
                                                                {condition}
                                                                <button
                                                                    onClick={() => setMedicalHistory(prev => ({
                                                                        ...prev,
                                                                        conditions: prev.conditions.filter((_, i) => i !== index)
                                                                    }))}
                                                                    className="hover:text-destructive"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-card/50 border-border">
                                                <CardHeader>
                                                    <CardTitle className="text-base">Past Surgeries</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Add surgery (e.g., Appendectomy 2020)"
                                                            value={newSurgery}
                                                            onChange={(e) => setNewSurgery(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && addSurgery()}
                                                            className="bg-background/50"
                                                        />
                                                        <Button onClick={addSurgery} size="icon" variant="secondary">
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {medicalHistory.surgeries.map((surgery, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm"
                                                            >
                                                                {surgery}
                                                                <button
                                                                    onClick={() => setMedicalHistory(prev => ({
                                                                        ...prev,
                                                                        surgeries: prev.surgeries.filter((_, i) => i !== index)
                                                                    }))}
                                                                    className="hover:text-destructive"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-card/50 border-border">
                                                <CardHeader>
                                                    <CardTitle className="text-base">Family History</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <Textarea
                                                        placeholder="Enter relevant family medical history..."
                                                        value={medicalHistory.familyHistory}
                                                        onChange={(e) => setMedicalHistory(prev => ({ ...prev, familyHistory: e.target.value }))}
                                                        className="bg-background/50"
                                                        rows={4}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        {/* Medications Tab */}
                                        <TabsContent value="medications" className="space-y-6">
                                            <Card className="bg-card/50 border-border">
                                                <CardHeader>
                                                    <CardTitle className="text-base">Current Medications</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-4 gap-2">
                                                        <Input
                                                            placeholder="Medication Name"
                                                            value={newMedication.name}
                                                            onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                                                            className="bg-background/50"
                                                        />
                                                        <Input
                                                            placeholder="Dosage (e.g., 10mg)"
                                                            value={newMedication.dosage}
                                                            onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                                                            className="bg-background/50"
                                                        />
                                                        <Input
                                                            placeholder="Frequency"
                                                            value={newMedication.frequency}
                                                            onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                                                            className="bg-background/50"
                                                        />
                                                        <Button onClick={addMedication} variant="secondary">
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add
                                                        </Button>
                                                    </div>

                                                    {medications.length > 0 && (
                                                        <div className="border border-border rounded-lg overflow-hidden">
                                                            <table className="w-full">
                                                                <thead className="bg-muted/30">
                                                                    <tr>
                                                                        <th className="text-left p-3 text-sm font-medium">Medication</th>
                                                                        <th className="text-left p-3 text-sm font-medium">Dosage</th>
                                                                        <th className="text-left p-3 text-sm font-medium">Frequency</th>
                                                                        <th className="text-right p-3 text-sm font-medium">Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {medications.map((med, index) => (
                                                                        <tr key={index} className="border-t border-border">
                                                                            <td className="p-3">{med.name}</td>
                                                                            <td className="p-3">{med.dosage}</td>
                                                                            <td className="p-3">{med.frequency}</td>
                                                                            <td className="p-3 text-right">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => setMedications(prev => prev.filter((_, i) => i !== index))}
                                                                                >
                                                                                    <X className="h-4 w-4 text-destructive" />
                                                                                </Button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        {/* Allergies Tab */}
                                        <TabsContent value="allergies" className="space-y-6">
                                            <Card className="bg-card/50 border-border">
                                                <CardHeader>
                                                    <CardTitle className="text-base">Known Allergies</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-4 gap-2">
                                                        <Input
                                                            placeholder="Allergen"
                                                            value={newAllergy.allergen}
                                                            onChange={(e) => setNewAllergy(prev => ({ ...prev, allergen: e.target.value }))}
                                                            className="bg-background/50"
                                                        />
                                                        <Select
                                                            value={newAllergy.severity}
                                                            onValueChange={(value) => setNewAllergy(prev => ({ ...prev, severity: value }))}
                                                        >
                                                            <SelectTrigger className="bg-background/50">
                                                                <SelectValue placeholder="Severity" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="mild">Mild</SelectItem>
                                                                <SelectItem value="moderate">Moderate</SelectItem>
                                                                <SelectItem value="severe">Severe</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Input
                                                            placeholder="Reaction"
                                                            value={newAllergy.reaction}
                                                            onChange={(e) => setNewAllergy(prev => ({ ...prev, reaction: e.target.value }))}
                                                            className="bg-background/50"
                                                        />
                                                        <Button onClick={addAllergy} variant="secondary">
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add
                                                        </Button>
                                                    </div>

                                                    {allergies.length > 0 && (
                                                        <div className="grid gap-3">
                                                            {allergies.map((allergy, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <AlertTriangle className={`h-5 w-5 ${allergy.severity === 'severe' ? 'text-destructive' :
                                                                            allergy.severity === 'moderate' ? 'text-yellow-500' : 'text-muted-foreground'
                                                                            }`} />
                                                                        <div>
                                                                            <p className="font-medium">{allergy.allergen}</p>
                                                                            <p className="text-sm text-muted-foreground">{allergy.reaction}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`px-2 py-1 rounded text-xs ${allergy.severity === 'severe' ? 'bg-destructive/20 text-destructive' :
                                                                            allergy.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-muted text-muted-foreground'
                                                                            }`}>
                                                                            {allergy.severity}
                                                                        </span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => setAllergies(prev => prev.filter((_, i) => i !== index))}
                                                                        >
                                                                            <X className="h-4 w-4 text-destructive" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        {/* Visit History Tab */}
                                        <TabsContent value="visit-history" className="space-y-6">
                                            <Card className="bg-card/50 border-border">
                                                <CardHeader>
                                                    <CardTitle className="text-base">Visit History</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                                        <Clock className="h-12 w-12 mb-4 opacity-50" />
                                                        <p>No visit history for new patients</p>
                                                        <p className="text-sm">Visit records will appear here after the patient's first visit</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        {/* Documents Tab */}
                                        <TabsContent value="documents" className="space-y-6">
                                            <Card className="bg-card/50 border-border">
                                                <CardHeader>
                                                    <CardTitle className="text-base">Documents</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                                                        <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                                        <p className="text-muted-foreground mb-2">Drop files here or click to upload</p>
                                                        <p className="text-sm text-muted-foreground">Support for PDF, JPG, PNG up to 10MB</p>
                                                        <Button variant="secondary" className="mt-4">
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Upload Document
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        {/* Notes Tab */}
                                        <TabsContent value="notes" className="space-y-6">
                                            <Card className="bg-card/50 border-border">
                                                <CardHeader>
                                                    <CardTitle className="text-base">Clinical Notes</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <Textarea
                                                        placeholder="Enter clinical notes, observations, or special instructions..."
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        className="bg-background/50 min-h-[200px]"
                                                        rows={8}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        {/* Prescription Tab */}
                                        <TabsContent value="prescription" className="space-y-6">
                                            <Card className="bg-card/50 border-border">
                                                <CardHeader>
                                                    <CardTitle className="text-base">Prescriptions</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                                        <FileCheck className="h-12 w-12 mb-4 opacity-50" />
                                                        <p>No prescriptions for new patients</p>
                                                        <p className="text-sm">Prescriptions can be added after the patient is created</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                    </div>
                                </Tabs>


                            </ScrollArea>

                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t border-border">
                            <Button variant="outline" size='sm' onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} size='sm' variant={'save'} className="bg-primary hover:bg-primary/90">
                                <Save className="h-4 w-4 mr-2" />
                                Save Patient
                            </Button>
                        </div>
                    </div>

                </DialogContent>
            </form>
        </Dialog>
    )
}
