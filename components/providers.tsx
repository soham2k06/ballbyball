"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

import { Toaster } from "./ui/sonner";

export function Provider({ children, ...props }: ThemeProviderProps) {
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
