import { stages, Stage } from "@/ATS/data/mockData";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StageProgressProps {
  currentStage: Stage;
  onStageChange?: (stage: Stage) => void;
}

const StageProgress = ({ currentStage, onStageChange }: StageProgressProps) => {
  const activeStages = stages.filter((s) => s.key !== "rejected");
  const currentIndex = activeStages.findIndex((s) => s.key === currentStage);
  const isRejected = currentStage === "rejected";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {activeStages.map((stage, i) => {
          const isPast = !isRejected && i < currentIndex;
          const isCurrent = !isRejected && i === currentIndex;
          return (
            <div key={stage.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => onStageChange?.(stage.key)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all",
                    isPast && "bg-success text-success-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isPast && !isCurrent && "bg-muted text-muted-foreground",
                    onStageChange && "cursor-pointer hover:ring-2 hover:ring-primary/30"
                  )}
                >
                  {isPast ? <Check className="h-4 w-4" /> : i + 1}
                </button>
                <span className={cn("text-xs whitespace-nowrap", isCurrent ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  {stage.label}
                </span>
              </div>
              {i < activeStages.length - 1 && (
                <div className={cn("mx-2 h-0.5 flex-1", isPast ? "bg-success" : "bg-muted")} />
              )}
            </div>
          );
        })}
      </div>
      {isRejected && (
        <div className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          Candidate has been rejected
        </div>
      )}
    </div>
  );
};

export default StageProgress;
