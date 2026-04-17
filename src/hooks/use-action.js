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
        async (input) => {
            setIsLoading(true);

            try {

                const result = await action(input);

                if (!result) {
                    return;
                }

                setFieldErrors(result.fieldErrors);

                if (result.error) {
                    setError(result.error);
                    optionsRef.current.onError?.(result.error);
                }

                if (result.data) {
                    setData(result.data);
                    optionsRef.current.onSuccess?.(result.data);
                }
            } finally {
                setIsLoading(false);
                optionsRef.current.onComplete?.();
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