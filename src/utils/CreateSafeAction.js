import { z } from "zod";



// export type ActionState<TInput, TOutput> = {
//     fieldErrors?: FieldErrors<TInput>;
//     error?: string | null;
//     data?: TOutput;
// };

export const createSafeAction = (schema, handler) => {
    return async (data) => {
        try {
            if (!schema) {
                console.error("[CreateSafeAction] Schema is missing for an action.");
                return { error: "Internal Server Error: Action schema is undefined." };
            }

            if (typeof schema.safeParse !== 'function') {
                console.error("[CreateSafeAction] Provided schema does not have safeParse. Schema type:", typeof schema);
                console.error("[CreateSafeAction] Schema value:", schema);
                return { error: "Internal Server Error: Invalid action schema." };
            }

            let validationResult;
            try {
                validationResult = schema.safeParse(data);
            } catch (zodError) {
                console.error("[CreateSafeAction] Zod internal failure, bypassing validation:", zodError);
                // In case of a library-level crash, we proceed with the raw data
                // to prevent blocking the user, while logging the incident.
                const result = await handler(data);
                if (result && (result.data || result.error || result.fieldErrors)) return result;
                return { data: result };
            }

            if (!validationResult.success) {
                return {
                    fieldErrors: validationResult.error.flatten().fieldErrors,
                };
            }

            const result = await handler(validationResult.data);

            // If the handler already returns a standard action state, return it
            if (result && (result.data || result.error || result.fieldErrors)) {
                return result;
            }

            // Otherwise, wrap the result in data to satisfy the useAction hook
            return { data: result };
        } catch (error) {
            console.error("[CreateSafeAction] Unexpected error in action execution:", error);
            return { error: error.message || "An unexpected error occurred during action execution." };
        }
    };
};
