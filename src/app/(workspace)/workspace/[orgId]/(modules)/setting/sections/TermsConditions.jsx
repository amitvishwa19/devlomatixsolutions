import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Users, Shield, Clock, Bell } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";
import { useAction } from "@/hooks/use-action";
import { upsertGeneralSetting } from "../_actions";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAppSettings } from "@/app/(workspace)/workspace/_provider/WorkspaceProvider";
import TipTap from "@/components/global/TipTap";

export const termsSchema = z.object({
    termsCondition: z
        .string()
        .min(1, 'Privacy Policy cannot be empty'),
});

export function TermsConditions() {
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession()
    const appSettings = useAppSettings()



    const form = useForm({
        resolver: zodResolver(termsSchema),
        defaultValues: {
            termsCondition: '<p>Terms and Condition</p>', // initial editor content
        },
    });

    useEffect(() => {
        if (!appSettings?.terms) return;

        form.reset({
            termsCondition: appSettings.terms, // ✅ HTML from backend
        });

    }, [appSettings, form]);


    const { execute } = useAction(upsertGeneralSetting, {
        onSuccess: (data) => {
            setLoading(false)
            toast.success('Terms and Conditions saved successfully', { id: 'terms' })
        },
        onError: (error) => {
            console.log(error)
            setLoading(false)
            toast.error('Oops somethig went wrong ! try again later', { id: 'terms' })
            setLoading(false);
        }
    })

    const onSubmit = async (data) => {

        try {
            setLoading(true)
            toast.loading("Saving Terms & Condition, please wait...", { id: 'terms' });
            await execute({ userId: session.user.userId, type: 'terms', payload: data.termsCondition })
        } catch (error) {

        }
    };

    return (
        <div className="flex flex-col h-full min-h-0">

            <SectionHeader
                title="Terms & Condition"
                description="Clear guidelines for using our services, designed to protect your rights and ensure a trustworthy experience."
                onSave={form.handleSubmit(onSubmit)}
                isSaving={loading}
            />

            {/* ✅ CRITICAL: flex-1 + min-h-0 */}
            <div className="flex flex-1 min-h-0 p-2">

                <Form {...form}>
                    {/* ✅ FORM MUST ALSO BE FLEX */}
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col flex-1 min-h-0 space-y-4"
                    >

                        <FormField
                            control={form.control}
                            name="termsCondition"
                            render={({ field }) => (
                                <FormItem className="flex flex-col flex-1 min-h-0">

                                    <FormControl className="flex-1 min-h-0">
                                        <TipTap
                                            data={field.value}              // ✅ input from form
                                            onChange={field.onChange}       // ✅ output to form
                                        />
                                    </FormControl>

                                    <FormMessage />

                                </FormItem>
                            )}
                        />

                    </form>
                </Form>

            </div>
        </div>
    );
}
