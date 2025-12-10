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
        return handler(validationResult.data);
    };
};

