import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSendEmail } from "@/hooks/useSendEmail";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export const SendEmailForm = ({ template, onBack }) => {
    const [recipient, setRecipient] = useState("");
    const [recipientError, setRecipientError] = useState("");
    const [variables, setVariables] = useState({});
    const { sendEmail, isLoading } = useSendEmail();

    useEffect(() => {
        const initialVars = {};
        template.variables.forEach((v) => {
            initialVars[v] = "";
        });
        setVariables(initialVars);
    }, [template]);

    const replaceVariables = (text) => {
        let result = text;
        Object.entries(variables).forEach(([key, value]) => {
            result = result.replace(new RegExp(`{{${key}}}`, "g"), value || `{{${key}}}`);
        });
        return result;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email
        const validation = emailSchema.safeParse(recipient);
        if (!validation.success) {
            setRecipientError(validation.error.errors[0].message);
            return;
        }
        setRecipientError("");

        const subject = replaceVariables(template.subject);
        const html = replaceVariables(template.body);

        const result = await sendEmail({
            to: recipient,
            subject,
            html,
        });

        if (result.success) {
            setRecipient("");
            const resetVars = {};
            template.variables.forEach((v) => {
                resetVars[v] = "";
            });
            setVariables(resetVars);
        }
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <Button
                variant="ghost"
                onClick={onBack}
                className="gap-2 text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Templates
            </Button>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="font-display flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" />
                            Send Email
                        </CardTitle>
                        <CardDescription>
                            Fill in the details to send "{template.name}"
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="recipient">Recipient Email *</Label>
                                <Input
                                    id="recipient"
                                    type="email"
                                    placeholder="patient@example.com"
                                    value={recipient}
                                    onChange={(e) => {
                                        setRecipient(e.target.value);
                                        setRecipientError("");
                                    }}
                                    className={recipientError ? "border-destructive" : ""}
                                    required
                                />
                                {recipientError && (
                                    <p className="text-sm text-destructive">{recipientError}</p>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium mb-3">Template Variables</h4>
                                <div className="space-y-3">
                                    {template.variables.map((variable) => (
                                        <div key={variable} className="space-y-1">
                                            <Label htmlFor={variable} className="text-sm capitalize">
                                                {variable.replace(/([A-Z])/g, " $1").trim()}
                                            </Label>
                                            <Input
                                                id={variable}
                                                placeholder={`Enter ${variable}`}
                                                value={variables[variable] || ""}
                                                onChange={(e) =>
                                                    setVariables((prev) => ({
                                                        ...prev,
                                                        [variable]: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full gradient-primary text-primary-foreground hover:opacity-90"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Email
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="font-display">Email Preview</CardTitle>
                        <CardDescription>
                            Subject: {replaceVariables(template.subject)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="border rounded-lg overflow-hidden bg-muted/30"
                            dangerouslySetInnerHTML={{
                                __html: replaceVariables(template.body),
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
