"use client";

import Link from "next/link";
import DarkModeToggle from "./DarkModeToggle";

function Footer() {
  return (
    <div className="fixed bottom-0 mt-4 w-full border-t bg-card/75 p-2 text-sm text-muted-foreground backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 max-md:flex-col">
        <div className="flex items-center gap-4">
          <Link href="/">
            <h2 className="text-xl font-semibold tracking-tight">
              &copy; BallByBall.
            </h2>
          </Link>
          <div className="md:hidden">
            <DarkModeToggle />
          </div>
        </div>
        <p className="font-medium">
          Built with ❤️ by{" "}
          <a
            href="https://github.com/soham2k06"
            className="text-foreground/80 underline"
          >
            Soham Bhikadiya
          </a>
        </p>
        <div className="max-md:hidden">
          <DarkModeToggle />
        </div>
      </div>
    </div>
  );
}

export default Footer;
