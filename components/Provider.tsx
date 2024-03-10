"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { Toaster } from "./ui/sonner";
import { useState } from "react";

interface ProviderProps extends ThemeProviderProps {}

export function Provider({ children, ...props }: ProviderProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000 * 5,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    },
  });

  const [queryClientState] = useState(() => queryClient);

  return (
    <QueryClientProvider client={queryClientState}>
      <NextThemesProvider {...props}>
        {children}
        <ToasterComponent />
      </NextThemesProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}

function ToasterComponent() {
  const theme = useTheme();
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme={theme.theme as "light" | "dark" | "system"}
    />
  );
}
