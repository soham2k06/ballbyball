import { signIn, useSession } from "next-auth/react";
import Link, { LinkProps } from "next/link";

interface NavItemProps extends LinkProps {
  children: React.ReactNode;
}

function NavItem({ children, href, ...props }: NavItemProps) {
  const { status } = useSession();

  const isPrivateAndUnauthenticated =
    status === "unauthenticated" && href !== "/guide" && href !== "/scorer";

  return (
    <li
      onClick={() => {
        if (isPrivateAndUnauthenticated) {
          signIn("google", { callbackUrl: href.toString() });
        }
      }}
    >
      <Link
        href={isPrivateAndUnauthenticated ? "/" : href}
        {...props}
        className="block rounded-md p-3 font-normal transition-colors hover:bg-secondary"
      >
        {children}
      </Link>
    </li>
  );
}

export default NavItem;
