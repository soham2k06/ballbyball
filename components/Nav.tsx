"use client";

import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";
import { dark } from "@clerk/themes";
import { usePathname } from "next/navigation";

function Nav() {
  const pathName = usePathname();
  const { theme } = useTheme();

  const blankRoutes = ["/start-a-match", "/scorer"];
  if (blankRoutes.includes(pathName)) return null;

  return (
    <nav className="border-b py-4 max-xl:p-4 max-sm:hidden">
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

        <div className="size-10">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              baseTheme: theme === "dark" ? dark : undefined,
              elements: {
                avatarBox: {
                  width: "100%",
                  height: "100%",
                },
              },
            }}
          />
        </div>
      </div>
    </nav>
  );
}

export default Nav;
