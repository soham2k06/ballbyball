"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { Toaster } from "./ui/sonner";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { theme } = useTheme();

  return (
    <NextThemesProvider {...props}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme={theme as "light" | "dark" | "system"}
      />
    </NextThemesProvider>
  );
}
