
'use client'
import { ShieldOff, ArrowLeft, Hospital, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Unauthorized = () => {
    const router = useRouter();

    const handleGoBack = () => {
        if (window.history.length > 1) {
            router.push(-1);
        } else {
            router.push("/");
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(210,80%,25%)] via-[hsl(200,70%,35%)] to-[hsl(180,60%,40%)]" />

            {/* Decorative circles */}
            <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-[-15%] left-[-10%] h-[600px] w-[600px] rounded-full bg-white/5 blur-3xl" />
            <div className="absolute top-[20%] left-[10%] h-[200px] w-[200px] rounded-full bg-white/10 blur-2xl" />

            {/* Floating medical icons */}
            <Heart className="absolute top-[15%] right-[15%] h-8 w-8 text-white/10 animate-pulse" />
            <Heart className="absolute bottom-[25%] left-[20%] h-6 w-6 text-white/10 animate-pulse" />

            {/* Hospital branding header */}
            <div className="absolute top-6 left-6 flex items-center gap-2 text-white/90">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <Hospital className="h-6 w-6" />
                </div>
                <span className="font-semibold text-lg">MediCare HMS</span>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="text-center space-y-6">
                        {/* Icon */}
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30 shadow-lg">
                            <ShieldOff className="h-12 w-12 text-white" />
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-white">
                                Access Denied
                            </h1>
                            <p className="text-white/70 leading-relaxed">
                                You don't have permission to access this section of the Hospital Management System.
                            </p>
                        </div>

                        {/* Error Code */}
                        <div className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/20">
                            <span className="text-sm font-mono text-white/80">Error Code: 403</span>
                        </div>

                        {/* Go Back Button */}
                        <Button
                            size="lg"
                            className="w-full gap-2 bg-white text-[hsl(210,80%,25%)] hover:bg-white/90 font-semibold shadow-lg transition-all hover:scale-[1.02]"
                            onClick={handleGoBack}
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Go Back
                        </Button>

                        {/* Support Info */}
                        <p className="text-sm text-white/60 pt-2">
                            Need help? Contact IT at{" "}
                            <span className="font-medium text-white/80 underline underline-offset-2">support@healthyfine.com</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-center text-sm text-white/50">
                © 2024 Healthyfine Hospital Management System
            </div>
        </div>
    );
};

export default Unauthorized;
