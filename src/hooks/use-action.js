import { useState, useCallback, useRef } from "react";



export const useAction = (
    action, options = {}
) => {
    const [fieldErrors, setFieldErrors] = useState(undefined);
    const [error, setError] = useState(undefined);
    const [data, setData] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const optionsRef = useRef(options);
    optionsRef.current = options;

    const execute = useCallback(
        async (input, context) => {
            setIsLoading(true);

            try {
                const result = await action(input);

                if (!result) {
                    return;
                }

                setFieldErrors(result.fieldErrors);

                if (result.error) {
                    setError(result.error);
                    optionsRef.current.onError?.(result.error, context);
                }

                if (result.data) {
                    setData(result.data);
                    optionsRef.current.onSuccess?.(result.data, context);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Something went wrong";
                setError(errorMessage);
                optionsRef.current.onError?.(errorMessage, context);
            } finally {
                setIsLoading(false);
                optionsRef.current.onComplete?.(context);
                optionsRef.current.onSettled?.(context);
            }
        },
        [action]
    );

    return {
        execute,
        fieldErrors,
        error,
        data,
        isLoading,
    };
};