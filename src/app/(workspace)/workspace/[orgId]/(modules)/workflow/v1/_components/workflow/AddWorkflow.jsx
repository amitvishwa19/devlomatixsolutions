'use client';
import React from 'react'
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";



const workflowStepSchema = z.object({
    type: z.enum(["OPD", "IPD"]),
    id: z
        .string()
        .min(2, "Step ID is required")
        .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
    name: z.string().min(2, "Name is required"),
    description: z.string().min(5, "Description is required"),
    icon: z.string().min(2, "Icon is required"),
    estimatedTime: z.string().optional(),
});


export default function AddWorkflow({ open, onOpenChange, defaultValues, onSubmit, }) {

    const form = useForm({
        resolver: zodResolver(workflowStepSchema),
        defaultValues: {
            type: "OPD",
            id: "",
            name: "",
            description: "",
            icon: "",
            estimatedTime: "",
            ...defaultValues,
        },
    });


    const handleSubmit = (values) => {
        onSubmit(values);
        onOpenChange(false);
        form.reset();
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>
                        {defaultValues ? "Edit Workflow Step" : "Add Workflow Step"}
                    </SheetTitle>
                </SheetHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-5 mt-6"
                    >
                        {/* OPD / IPD */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Workflow Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="OPD">OPD</SelectItem>
                                            <SelectItem value="IPD">IPD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Step ID */}
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Step ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. consultation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Step Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Consultation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Doctor consultation and examination"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Icon */}
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lucide Icon</FormLabel>
                                    <FormControl>
                                        <Input placeholder="stethoscope" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Estimated Time */}
                        <FormField
                            control={form.control}
                            name="estimatedTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estimated Time</FormLabel>
                                    <FormControl>
                                        <Input placeholder="15–30 min" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <SheetFooter className="pt-4">
                            <Button type="submit" className="w-full">
                                Save Step
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
