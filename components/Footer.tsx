"use client";

import DarkModeToggle from "./DarkModeToggle";
import { usePathname } from "next/navigation";

function Footer() {
  const pathname = usePathname();

  // Not showing footer on match page
  if (pathname.includes("match/")) return null;

  return (
    <div className="sticky bottom-0 mt-4 w-full border-t bg-card/75 p-2 text-sm text-muted-foreground backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          &copy; BallByBall.
        </h2>
        <p className="font-medium">
          Built with ❤️ by{" "}
          <a
            href="https://github.com/soham2k06"
            className="text-foreground/80 underline"
          >
            Soham Bhikadiya
          </a>
        </p>
        <DarkModeToggle />
      </div>
    </div>
  );
}

export default Footer;
