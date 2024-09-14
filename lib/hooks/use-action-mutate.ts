import { useCallback, useState } from "react";

type MutationStatus = "idle" | "loading" | "error" | "success";

interface MutationOptions<TData, TError> {
  // eslint-disable-next-line no-unused-vars
  onSuccess?: (data: TData) => void;
  // eslint-disable-next-line no-unused-vars
  onError?: (error: TError) => void;
  onSettled?: () => void;
}

interface MutateOptions<TData, TError> extends MutationOptions<TData, TError> {}

function useActionMutate<TVariables, TData, TError = unknown>(
  // eslint-disable-next-line no-unused-vars
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TError> = {},
) {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [error, setError] = useState<TError | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(
    async (
      variables: TVariables,
      mutateOptions: MutateOptions<TData, TError> = {},
    ) => {
      setStatus("loading");
      setError(null);

      const mergedOptions = { ...options, ...mutateOptions };

      try {
        const result = await mutationFn(variables);
        setData(result);
        setStatus("success");
        mergedOptions.onSuccess?.(result);
      } catch (err) {
        setError(err as TError);
        setStatus("error");
        mergedOptions.onError?.(err as TError);
      } finally {
        mergedOptions.onSettled?.();
      }
    },
    [mutationFn, options],
  );

  return {
    mutate,
    status,
    error,
    data,
    isIdle: status === "idle",
    isPending: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
  };
}

export { useActionMutate };
