import { cn } from "@/lib/utils";
import { stages } from "../_utils/mockData";

const StageBadge = ({ stage, className }) => {
  const stageInfo = stages.find((s) => s.key === stage);
  if (!stageInfo) return null;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", stageInfo.color, className)}>
      {stageInfo.label}
    </span>
  );
};

export default StageBadge;
