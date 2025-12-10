import { CircleCheckIcon, CircleDashedIcon, CircleXIcon, Loader2Icon } from "lucide-react"
import { ExecutionPhaseStatus } from "../../../../types/types"

export function PhaseExecutionBadge({ status }) {

    if (status === ExecutionPhaseStatus.PENDING) {
        return <CircleDashedIcon size={20} className="stroke-muted-foreground" />
    } else if (status === ExecutionPhaseStatus.RUNNING) {
        return <Loader2Icon size={20} className="animate-spin stroke-yellow-500" />
    } else if (status === ExecutionPhaseStatus.FAILED) {
        return <CircleXIcon size={20} className="stroke-destructive" />
    } else if (status === ExecutionPhaseStatus.COMPLETED) {
        return <CircleCheckIcon size={20} className="stroke-green-500" />
    } else {
        return <div className="rounded-full">{status}</div>
    }
}