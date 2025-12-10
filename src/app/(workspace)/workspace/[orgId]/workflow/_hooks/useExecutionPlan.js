import { useReactFlow } from "@xyflow/react"
import { useCallback, useContext } from "react"
import { FlowValidationContext } from "../_context/FlowValidationContext"
import { useFlowValidation } from "./useFlowValidation"
import { toast } from "sonner"
import { FlowToExecutionPlan, FlowToExecutionPlanValidationError } from "../_actions/executionPlan"

export const useExecutionPlan = () => {

    const { toObject } = useReactFlow()
    const { setInvalidInputs, clearErrors } = useFlowValidation()

    const handleError = useCallback((error) => {
        switch (error.type) {
            case FlowToExecutionPlanValidationError.NOENTRYPOINT:
                toast.error('No entry point defined')
                break
            case FlowToExecutionPlanValidationError.INVALIDINPUTS:
                //toast.error('All input points is not set')
                setInvalidInputs(error.invalidElement)
                {
                    console.log('@error', error)
                }
                break
            default:
                toast.error('Something went wrong')
        }
    }, [setInvalidInputs])


    //console.log('useExecutionPlan', toObject())
    const generateExecutionPlan = useCallback(() => {
        const { nodes, edges } = toObject()
        const { executionPlan, error } = FlowToExecutionPlan(nodes, edges)

        if (error) {
            handleError(error)
            return null
        }

        clearErrors()
        return executionPlan;
    }, [toObject, handleError, clearErrors])

    return generateExecutionPlan
}