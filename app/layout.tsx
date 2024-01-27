import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Scorer",
  description: "Your cricket partner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          enableSystem
          defaultTheme="system"
          disableTransitionOnChange
        >
          {/* <Nav /> */}
          <main className="max-w-7xl mx-auto  h-[calc(100dvh-4.5rem)]">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
