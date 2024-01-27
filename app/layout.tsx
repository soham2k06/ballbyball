import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ball By Ball | Your cricket partner",
  description: "Your cricket partner",
  creator: "Soham Bhikadiya & Rudra Bhikadiya",
  keywords: [
    "cricket",
    "scorer",
    "score",
    "scorecard",
    "cricket scorer",
    "cricket score",
    "cricket scorecard",
    "cricket score card",
    "cricket scorecard maker",
    "cricket score card maker",
    "cricket scorecard generator",
    "cricket score card generator",
    "cricket scorecard creator",
    "cricket score card creator",
    "cricket scorecard builder",
    "cricket score card builder",
    "cricket scorecard template",
    "cricket score card template",
    "cricket scorecard format",
    "cricket score card format",
    "cricket scorecard online",
    "cricket score card online",
    "cricket scorecard app",
    "cricket score card app",
    "cricket scorecard software",
    "cricket score card software",
    "cricket scorecard excel",
    "cricket score card excel",
    "cricket scorecard sheet",
    "cricket score card sheet",
    "cricket scorecard pdf",
    "cricket score card pdf",
    "cricket scorecard live",
    "cricket score card live",
    "cricket scorecard free",
    "cricket score card free",
    "cricket scorecard maker online",
    "cricket score card maker online",
    "cricket scorecard generator online",
    "cricket score card generator online",
    "cricket scorecard creator online",
    "cricket score card creator online",
    "cricket scorecard builder online",
    "cricket score card builder online",
    "cricket scorecard template online",
    "cricket score card template online",
    "cricket scorecard format online",
    "cricket score card format online",
    "cricket scorecard online free",
    "cricket score card online free",
    "cricket scorecard app free",
    "cricket score card app free",
    "cricket scorecard software free",
    "cricket score card software free",
    "cricket scorecard excel free",
    "cricket score card excel free",
    "cricket scorecard sheet free",
    "cricket score card sheet free",
    "cricket scorecard pdf free",
    "cricket score card pdf free",
    "cricket scorecard live free",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎾</text></svg>"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          enableSystem
          defaultTheme="system"
          disableTransitionOnChange
        >
          <main className="max-w-7xl mx-auto overscroll-none md:h-dvh">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
