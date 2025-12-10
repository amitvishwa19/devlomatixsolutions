import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";



const tasks = [
    {
        id: "1",
        title: "Review lab results for Patient #2847",
        dueTime: "10:00 AM",
        priority: "high",
        completed: false,
    },
    {
        id: "2",
        title: "Call pharmacy for prescription refill",
        dueTime: "11:30 AM",
        priority: "medium",
        completed: false,
    },
    {
        id: "3",
        title: "Update patient records",
        dueTime: "1:00 PM",
        priority: "low",
        completed: true,
    },
    {
        id: "4",
        title: "Prepare equipment for afternoon surgery",
        dueTime: "2:30 PM",
        priority: "high",
        completed: false,
    },
    {
        id: "5",
        title: "Staff meeting - Room 204",
        dueTime: "4:00 PM",
        priority: "medium",
        completed: false,
    },
];

const priorityStyles = {
    high: "text-destructive",
    medium: "text-warning",
    low: "text-muted-foreground",
};

const priorityBg = {
    high: "bg-destructive/10",
    medium: "bg-warning/10",
    low: "bg-muted/50",
};

export function UpcomingTasks() {
    return (
        <div className="rounded-xl border border-border/50 bg-card dark:bg-darkSecondaryBackground p-5 shadow-card animate-slide-up" style={{ animationDelay: "450ms" }}>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Today's Tasks</h3>
                <span className="text-sm text-muted-foreground">
                    {tasks.filter(t => !t.completed).length} remaining
                </span>
            </div>

            <div className="space-y-2">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={cn(
                            "flex items-start gap-3 rounded-lg p-3 transition-colors",
                            task.completed ? "bg-muted/30 opacity-60" : "bg-background/50 hover:bg-accent/20"
                        )}
                    >
                        <button className="mt-0.5 flex-shrink-0">
                            {task.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-success" />
                            ) : (
                                <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                            )}
                        </button>

                        <div className="flex-1 min-w-0">
                            <p className={cn(
                                "text-sm font-medium",
                                task.completed ? "text-muted-foreground line-through" : "text-foreground"
                            )}>
                                {task.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {task.dueTime}
                                </span>
                                {!task.completed && task.priority === "high" && (
                                    <span className={cn("flex items-center gap-1 text-xs", priorityStyles[task.priority])}>
                                        <AlertCircle className="h-3 w-3" />
                                        Urgent
                                    </span>
                                )}
                            </div>
                        </div>

                        {!task.completed && (
                            <span className={cn(
                                "flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                                priorityBg[task.priority],
                                priorityStyles[task.priority]
                            )}>
                                {task.priority}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
