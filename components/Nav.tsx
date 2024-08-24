"use client";

import Link from "next/link";
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
import { Skeleton } from "./ui/skeleton";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { processTeamName } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import GoogleButton from "./google-button";

function Nav() {
  const { data, status } = useSession();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-10 border-b bg-card py-4 max-xl:p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/">
          <div className="text-2xl font-semibold tracking-tighter">
            ballbyball.
          </div>
        </Link>
        <ul className="hidden md:flex">
          {navItems.map((item) => (
            <NavItem key={item.name} href={item.href}>
              {item.name}
            </NavItem>
          ))}
        </ul>
        {status === "loading" ? (
          <Skeleton className="size-10 animate-pulse rounded-full text-center leading-10" />
        ) : data ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar>
                <AvatarImage src={data.user?.image ?? ""} />
                <AvatarFallback>
                  {processTeamName(data?.user?.name ?? "")}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{data.user?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <GoogleButton />
        )}

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
