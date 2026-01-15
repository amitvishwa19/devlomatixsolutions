import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    Loader2,
    Bell,
    Download,
    Mail,
    Trash2,
    Undo2,
    Settings,
    User,
    CreditCard,
} from "lucide-react";

const CustomToast = () => {
    // Basic toasts
    const showSuccessToast = () => {
        toast.success("Changes saved successfully!");
    };

    const showErrorToast = () => {
        toast.error("Failed to save changes. Please try again.");
    };

    const showWarningToast = () => {
        toast.warning("Your session will expire in 5 minutes.");
    };

    const showInfoToast = () => {
        toast.info("New features are available. Check them out!");
    };

    // Toast with description
    const showToastWithDescription = () => {
        toast.message("Payment received", "Your payment of $49.99 has been processed successfully.");
    };

    // Toast with action
    const showToastWithAction = () => {
        toast.action(
            "Message deleted",
            {
                label: "Undo",
                onClick: () => toast.success("Message restored"),
            },
            {
                icon: <Trash2 className="h-5 w-5 text-muted-foreground" />,
            }
        );
    };

    // Promise toast
    const showPromiseToast = () => {
        const promise = new Promise < { name: string } > ((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.3) {
                    resolve({ name: "Document" });
                } else {
                    reject(new Error("Upload failed"));
                }
            }, 2000);
        });

        toast.promise(promise, {
            loading: "Uploading file...",
            success: (data) => `${data.name} uploaded successfully!`,
            error: "Upload failed. Please try again.",
        });
    };

    // Loading toast
    const showLoadingToast = () => {
        const toastId = toast.loading("Processing your request...");

        setTimeout(() => {
            toast.dismiss(toastId);
            toast.success("Request completed!");
        }, 3000);
    };

    // Custom toast
    const showCustomToast = () => {
        toast.custom(
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Bell className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-card-foreground">New notification</p>
                    <p className="text-sm text-muted-foreground">You have 3 new messages</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.dismiss()}>
                    View all
                </Button>
            </div>,
            {
                duration: 5000,
            }
        );
    };

    // Rich custom toast with avatar
    const showRichToast = () => {
        toast.custom(
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-xl max-w-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60">
                    <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                    <p className="font-semibold text-card-foreground">John Doe commented</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        "Great work on the new design! The color scheme looks amazing."
                    </p>
                    <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="default" onClick={() => toast.dismiss()}>
                            Reply
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toast.dismiss()}>
                            Dismiss
                        </Button>
                    </div>
                </div>
            </div>,
            {
                duration: 8000,
            }
        );
    };

    // Payment success toast
    const showPaymentToast = () => {
        toast.custom(
            <div className="flex items-center gap-4 rounded-xl border border-toast-success-border bg-toast-success-bg p-4 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-toast-success/10">
                    <CreditCard className="h-6 w-6 text-toast-success" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-toast-success">Payment successful</p>
                    <p className="text-sm text-toast-success/80">$99.00 has been charged to your card</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-toast-success" />
            </div>,
            {
                duration: 5000,
            }
        );
    };

    // Download progress toast
    const showDownloadToast = () => {
        const toastId = toast.custom(
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xl min-w-[320px]">
                <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                        <p className="font-semibold text-card-foreground">Downloading file...</p>
                        <p className="text-sm text-muted-foreground">document.pdf (2.4 MB)</p>
                    </div>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300"
                        style={{ width: '0%', animation: 'progress-bar 3s linear reverse forwards' }}
                    />
                </div>
            </div>,
            {
                duration: 3000,
            }
        );

        setTimeout(() => {
            toast.dismiss(toastId);
            toast.success("Download complete!", {
                description: "document.pdf saved to Downloads",
            });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-4xl space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Sonner Toast System
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        A beautiful, customizable toast notification system with multiple variants,
                        rich content support, and smooth animations.
                    </p>
                </div>

                {/* Basic Toasts */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                        <Bell className="h-6 w-6" />
                        Basic Toasts
                    </h2>
                    <p className="text-muted-foreground">
                        Standard toast notifications with different severity levels.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                            onClick={showSuccessToast}
                            className="bg-toast-success hover:bg-toast-success/90 text-white"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Success
                        </Button>
                        <Button
                            onClick={showErrorToast}
                            className="bg-toast-error hover:bg-toast-error/90 text-white"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Error
                        </Button>
                        <Button
                            onClick={showWarningToast}
                            className="bg-toast-warning hover:bg-toast-warning/90 text-white"
                        >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Warning
                        </Button>
                        <Button
                            onClick={showInfoToast}
                            className="bg-toast-info hover:bg-toast-info/90 text-white"
                        >
                            <Info className="mr-2 h-4 w-4" />
                            Info
                        </Button>
                    </div>
                </section>

                {/* Advanced Toasts */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                        <Settings className="h-6 w-6" />
                        Advanced Features
                    </h2>
                    <p className="text-muted-foreground">
                        Toasts with descriptions, actions, and async support.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Button variant="outline" onClick={showToastWithDescription}>
                            <Mail className="mr-2 h-4 w-4" />
                            With Description
                        </Button>
                        <Button variant="outline" onClick={showToastWithAction}>
                            <Undo2 className="mr-2 h-4 w-4" />
                            With Action
                        </Button>
                        <Button variant="outline" onClick={showPromiseToast}>
                            <Download className="mr-2 h-4 w-4" />
                            Promise Toast
                        </Button>
                        <Button variant="outline" onClick={showLoadingToast}>
                            <Loader2 className="mr-2 h-4 w-4" />
                            Loading Toast
                        </Button>
                        <Button variant="outline" onClick={showDownloadToast}>
                            <Download className="mr-2 h-4 w-4" />
                            Progress Toast
                        </Button>
                    </div>
                </section>

                {/* Custom Toasts */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                        <User className="h-6 w-6" />
                        Custom Toasts
                    </h2>
                    <p className="text-muted-foreground">
                        Fully customizable toast components with rich content.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Button variant="secondary" onClick={showCustomToast}>
                            <Bell className="mr-2 h-4 w-4" />
                            Notification
                        </Button>
                        <Button variant="secondary" onClick={showRichToast}>
                            <User className="mr-2 h-4 w-4" />
                            Rich Content
                        </Button>
                        <Button variant="secondary" onClick={showPaymentToast}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Payment
                        </Button>
                    </div>
                </section>

                {/* Documentation */}
                <section className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-card-foreground">Usage</h2>
                    <div className="rounded-lg bg-muted p-4 overflow-x-auto">
                        <pre className="text-sm text-foreground font-mono">
                            {`import { toast } from "@/components/ui/sonner";

// Basic usage
toast.success("Success message");
toast.error("Error message");
toast.warning("Warning message");
toast.info("Info message");

// With description
toast.message("Title", "Description text");

// With action
toast.action("Deleted", {
  label: "Undo",
  onClick: () => handleUndo()
});

// Promise handling
toast.promise(asyncFn(), {
  loading: "Loading...",
  success: "Done!",
  error: "Failed"
});

// Custom content
toast.custom(<YourComponent />);`}
                        </pre>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ToastDemo;
