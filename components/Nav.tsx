"use client";

import Link from "next/link";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

import { Menu } from "lucide-react";

import { navItems } from "@/lib/constants";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TypographyH2 } from "./ui/typography";

import NavItem from "./NavItem";
import { useState } from "react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

function Nav() {
  const { theme } = useTheme();

  const { isLoaded } = useUser();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <nav className="sticky top-0 border-b bg-card py-4 max-xl:p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/">
          <h1 className="text-2xl font-semibold tracking-tighter">
            ballbyball.
          </h1>
        </Link>
        <ul className="hidden md:flex">
          {navItems.map((item) => (
            <NavItem key={item.name} href={item.href}>
              {item.name}
            </NavItem>
          ))}
        </ul>
        <SignedIn>
          <div className="max-md:ml-auto max-md:mr-4">
            {isLoaded ? (
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
            ) : (
              <Skeleton className="size-10 animate-pulse rounded-full text-center leading-10" />
            )}
          </div>
        </SignedIn>
        <SignedOut>
          <Button className="btn btn-primary" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </SignedOut>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger className="mr-4 md:hidden">
            <Menu />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader className="mb-4 text-left">
              <Link href="/">
                <TypographyH2 className="text-2xl font-semibold tracking-tighter">
                  ballbyball.
                </TypographyH2>
              </Link>
            </SheetHeader>
            <ul>
              {navItems.map((item) => (
                <NavItem
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSheetOpen(false)}
                >
                  {item.name}
                </NavItem>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default Nav;
