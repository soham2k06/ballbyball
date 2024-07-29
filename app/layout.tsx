import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Lato } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

// If loading a variable font, you don't need to specify the font weight
const lato = Lato({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Ball By Ball | Your cricket partner",
  description: "Your cricket partner",
  creator: "Soham Bhikadiya & Rudra Bhikadiya",
  keywords: [
    "ball by ball",
    "ball",
    "by",
    "ball by ball cricket",
    "ball by ball cricket score",
    "ball by ball cricket scorecard",
    "ball by ball cricket score card",
    "ball by ball cricket scorecard maker",
    "ball by ball cricket score card maker",
    "ball by ball cricket scorecard generator",
    "ball by ball cricket score card generator",
    "ball by ball cricket scorecard creator",
    "ball by ball cricket score card creator",
    "ball by ball cricket scorecard builder",
    "ball by ball cricket score card builder",
    "ball by ball cricket scorecard template",
    "ball by ball cricket score card template",
    "ball by ball cricket scorecard format",
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
    "ball by ball cricket score card format",
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

export default async function RootLayout({
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
        <meta
          name="google-site-verification"
          content="VoqGlTAQWR5pCGtJXLewyVpsxWiR1LZr4yRhSg30U-o"
        />
        <meta name="google-adsense-account" content="ca-pub-7226440547183724" />
      </head>
      <body className={cn("antialiased", lato.className)}>
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
