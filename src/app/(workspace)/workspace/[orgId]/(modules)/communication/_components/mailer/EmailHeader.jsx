import { Mail, Send } from "lucide-react";

export const EmailHeader = () => {
    return (
        <div className="relative overflow-hidden gradient-hero rounded-2xl p-8 mb-8 animate-fade-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex items-center gap-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                    <Mail className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Email Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Send professional emails using pre-built templates
                    </p>
                </div>
            </div>

            <div className="relative z-10 mt-6 flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Send className="w-4 h-4 text-primary" />
                    <span>Powered by Resend</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span>Ready to send</span>
                </div>
            </div>
        </div>
    );
};
