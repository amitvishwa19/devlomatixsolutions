import { cn } from "@/lib/utils";
import { Stage, stages } from "@/ATS/data/mockData";

interface StageBadgeProps {
  stage: Stage;
  className?: string;
}

const StageBadge = ({ stage, className }: StageBadgeProps) => {
  const stageInfo = stages.find((s) => s.key === stage);
  if (!stageInfo) return null;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", stageInfo.color, className)}>
      {stageInfo.label}
    </span>
  );
};

export default StageBadge;
