import type { Metadata } from "next";

import { Lato } from "next/font/google";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SessionProvider } from "next-auth/react";

import { cn } from "@/lib/utils";

import "./globals.css";

import { Provider } from "@/components/providers";

// If loading a variable font, you don't need to specify the font weight
const lato = Lato({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  applicationName: "BallByBall",
  title: "BallByBall | Your Cricket Scoring Partner",
  description:
    "BallByBall is your ultimate cricket scoring partner. Add players, teams, and matches effortlessly. Track scores ball by ball, access real-time updates, and share scorecards with ease. Enjoy comprehensive analytics, intuitive features, and a free, user-friendly experience. Sign in and start scoring today!",
  keywords: [
    "ballbyball",
    "ballbyball cricket scoring",
    "ballbyball cricket score",
    "ballbyball cricket scorecard",
    "ballbyball cricket score card",
    "ballbyball scorecard maker",
    "ballbyball score card maker",
    "ballbyball scorecard generator",
    "ballbyball score card generator",
    "ballbyball scorecard creator",
    "ballbyball score card creator",
    "ballbyball scorecard builder",
    "ballbyball score card builder",
    "ballbyball scorecard template",
    "ballbyball score card template",
    "ballbyball scorecard format",
    "ball by ball",
    "ball by ball cricket scoring",
    "ball by ball cricket score",
    "ball by ball cricket scorecard",
    "ball by ball cricket score card",
    "ball by ball scorecard maker",
    "ball by ball score card maker",
    "ball by ball scorecard generator",
    "ball by ball score card generator",
    "ball by ball scorecard creator",
    "ball by ball score card creator",
    "ball by ball scorecard builder",
    "ball by ball score card builder",
    "ball by ball scorecard template",
    "ball by ball score card template",
    "ball by ball scorecard format",
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
    "cricket scoring",
    "live cricket scoring",
    "online cricket scoring",
    "free cricket scoring",
    "cricket scoring app",
    "cricket scoring software",
    "cricket scoring online",
    "real-time cricket scoring",
  ],
  authors: {
    name: "Soham Bhikadiya",
    url: "https://sohamb.tech",
  },

  openGraph: {
    title: "BallByBall | Your cricket partner",
    description:
      "Add players, teams, and matches. Keep track of the score ball by ball. Share the scorecard with your friends. Ball By Ball is your cricket partner 🏏. It's totally free, just signin and start scoring! Cheers!",
    images: "/opengraph-banner.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta
          name="google-site-verification"
          content="VoqGlTAQWR5pCGtJXLewyVpsxWiR1LZr4yRhSg30U-o"
        />
        <meta
          name="google-adsense-account"
          content="ca-pub-7226440547183724"
        ></meta>
      </head>
      <body className={cn("antialiased", lato.className)}>
        <SessionProvider>
          <Provider
            attribute="class"
            enableSystem
            defaultTheme="system"
            disableTransitionOnChange
          >
            {children}
          </Provider>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
