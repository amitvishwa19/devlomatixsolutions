import { useContext } from "react";
import { FlowValidationContext } from "../_context/FlowValidationContext";

export function useFlowValidation() {
    const context = useContext(FlowValidationContext)

    if (!context) {
        throw new Error('useFlowValidation must be used within a FlowValidationContext')
    }

    return context;
}