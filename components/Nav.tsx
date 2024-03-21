"use client";

import Link from "next/link";

import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

function Nav() {
  const { theme } = useTheme();

  return (
    <nav className="border-b py-4 max-xl:p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/">
          <h1 className="text-2xl font-semibold tracking-tighter">
            ballbyball.
          </h1>
        </Link>
        <ul className="flex">
          <Link href="/matches">
            <li className="rounded-md p-3 font-normal transition-colors hover:bg-secondary">
              Matches
            </li>
          </Link>
          <Link href="/players">
            <li className="rounded-md p-3 font-normal transition-colors hover:bg-secondary">
              Players
            </li>
          </Link>
          <Link href="/teams">
            <li className="rounded-md p-3 font-normal transition-colors hover:bg-secondary">
              Teams
            </li>
          </Link>
          <Link href="/scorer">
            <li className="rounded-md p-3 font-normal transition-colors hover:bg-secondary">
              Normal Scoring
            </li>
          </Link>
        </ul>

        <UserButton
          afterSignOutUrl="/"
          appearance={{
            baseTheme: theme === "dark" ? dark : undefined,
            elements: {
              avatarBox: {
                width: "2.5rem",
                height: "2.5rem",
              },
            },
          }}
        />
      </div>
    </nav>
  );
}

export default Nav;
