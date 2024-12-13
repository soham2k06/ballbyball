"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Eye, Menu, X } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import { navItems } from "@/lib/constants";
import { abbreviateEntity } from "@/lib/utils";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";

import DarkModeToggle from "./dark-mode-toggle";
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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

        <Drawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          direction="right"
        >
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            {userRef && (
              <div className="flex size-10 items-center justify-center rounded-full border bg-muted/40">
                <Eye className="size-5" />
              </div>
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
            <DrawerTrigger className="md:hidden">
              <Menu />
            </DrawerTrigger>
          </div>
          <DrawerContent direction="right">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-4"
              onClick={() => setIsDrawerOpen(false)}
            >
              <X className="size-5" />
            </Button>
            <DrawerHeader className="mb-4 text-left">
              <Link href="/">
                <TypographyH2 className="text-2xl font-semibold tracking-tighter">
                  ballbyball.
                </TypographyH2>
              </Link>
            </DrawerHeader>
            <ul>
              {navItems.map((item) => (
                <NavItem
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  {item.name}
                </NavItem>
              ))}
            </ul>
            <p className="mb-2 mt-auto text-center text-sm">
              Made with ❤️ by{" "}
              <a
                href="https://sohamb.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Soham Bhikadiya
              </a>
            </p>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
}

export default Nav;
