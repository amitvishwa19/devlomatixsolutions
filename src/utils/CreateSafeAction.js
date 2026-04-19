import { z } from "zod";



// export type ActionState<TInput, TOutput> = {
//     fieldErrors?: FieldErrors<TInput>;
//     error?: string | null;
//     data?: TOutput;
// };

export const createSafeAction = (schema, handler) => {
    return async (data) => {
        const validationResult = schema.safeParse(data);
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
    };
};

