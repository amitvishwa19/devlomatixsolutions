import { useState } from "react";
import { toast } from "sonner";


export const useSendEmail = () => {
    const [isLoading, setIsLoading] = useState(false);


    const sendEmail = async (params) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("send-email", {
                body: params,
            });

            if (error) {
                throw error;
            }

            toast({
                title: "Email Sent Successfully",
                description: `Email sent to ${params.to}`,
            });

            return { success: true, data };
        } catch (error) {
            console.error("Error sending email:", error);
            toast({
                title: "Failed to Send Email",
                description: error.message || "An error occurred while sending the email",
                variant: "destructive",
            });
            return { success: false, error };
        } finally {
            setIsLoading(false);
        }
    };

    return { sendEmail, isLoading };
};
