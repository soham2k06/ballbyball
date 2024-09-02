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
import { signOut } from "next-auth/react";
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
import { useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Session } from "next-auth";

function Nav({
  session,
  loading,
}: {
  session: Session | null;
  loading?: boolean;
}) {
  const searchParams = useSearchParams();
  const userRef = searchParams.get("user");

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  function handleCopyLink() {
    const userId = session?.user?.id;
    if (!userId) return toast.error("Error getting link");
    const link = `${window.location.origin}/?user=${userId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  }

  return (
    <nav className="sticky top-0 z-10 border-b bg-card py-4 max-xl:p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href={userRef ? `/?user=${userRef}` : "/"}>
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

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <div className="flex gap-3">
            {userRef && (
              <Button variant="secondary" asChild>
                <Link href="/">Leave</Link>
              </Button>
            )}
            {loading ? (
              <Skeleton className="size-10 animate-pulse rounded-full text-center leading-10" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar>
                    <AvatarImage src={session.user?.image ?? ""} />
                    <AvatarFallback>
                      {processTeamName(session?.user?.name ?? "")}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign out
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <GoogleButton />
            )}
            <SheetTrigger className="md:hidden">
              <Menu />
            </SheetTrigger>
          </div>
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
