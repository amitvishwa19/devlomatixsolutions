import { Check } from "lucide-react";
import { cn } from "@/lib/utils";


export function StepIndicator({ steps, currentStep }) {
    return (
        <div className="flex items-center justify-between">
            {steps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                    <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                                    isCompleted && "bg-primary-foreground text-primary",
                                    isCurrent &&
                                    "bg-primary-foreground/30 text-primary-foreground border-2 border-primary-foreground",
                                    !isCompleted &&
                                    !isCurrent &&
                                    "bg-primary-foreground/10 text-primary-foreground/60"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    step.id
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-xs mt-2 font-medium transition-colors hidden sm:block",
                                    isCurrent
                                        ? "text-primary-foreground"
                                        : "text-primary-foreground/60"
                                )}
                            >
                                {step.title}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "flex-1 h-0.5 mx-3 transition-colors duration-300",
                                    isCompleted
                                        ? "bg-primary-foreground"
                                        : "bg-primary-foreground/20"
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
