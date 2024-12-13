import Link, { LinkProps } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { signIn, useSession } from "next-auth/react";

import { cn } from "@/lib/utils";

interface NavItemProps extends LinkProps {
  children: React.ReactNode;
}

function NavItem({ children, href, ...props }: NavItemProps) {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const userRef = searchParams.get("user");

  const isPrivateAndUnauthenticated =
    !userRef &&
    status === "unauthenticated" &&
    href !== "/guide" &&
    href !== "/scorer";

  const isActive = href === pathname;

  return (
    <li
      onClick={() => {
        if (isPrivateAndUnauthenticated) {
          signIn("google", { callbackUrl: href.toString() });
        }
      }}
    >
      <Link
        href={
          isPrivateAndUnauthenticated
            ? "/"
            : href + (userRef ? `?user=${userRef}` : "")
        }
        {...props}
        className={cn(
          "block rounded-md p-3 font-normal transition-colors hover:bg-secondary",
          {
            "bg-primary-foreground text-primary": isActive,
          },
        )}
      >
        {children}
      </Link>
    </li>
  );
}

export default NavItem;
