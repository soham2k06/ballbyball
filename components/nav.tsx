"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Menu } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import { navItems } from "@/lib/constants";
import { abbreviateEntity } from "@/lib/utils";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

import GoogleButton from "./google-button";
import NavItem from "./nav-item";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { TypographyH2 } from "./ui/typography";

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
        <Link
          href={userRef ? `/?user=${userRef}` : "/"}
          className="inline-flex items-center gap-2"
        >
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
          <h2 className="text-2xl font-semibold tracking-tighter md:hidden lg:block">
            ballbyball.
          </h2>
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
                      {abbreviateEntity(session?.user?.name ?? "")}
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
