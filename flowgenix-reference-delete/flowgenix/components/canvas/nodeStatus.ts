export type NodeRunStatus = "idle" | "running" | "success" | "error";

export const statusRingClass = (status?: NodeRunStatus) => {
  switch (status) {
    case "running":
      return "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse shadow-[0_0_24px_hsl(var(--primary)/0.55)]";
    case "success":
      return "ring-2 ring-[hsl(142_70%_50%)] ring-offset-2 ring-offset-background shadow-[0_0_18px_hsl(142_70%_50%/0.45)]";
    case "error":
      return "ring-2 ring-destructive ring-offset-2 ring-offset-background shadow-[0_0_18px_hsl(var(--destructive)/0.5)]";
    default:
      return "";
  }
};
