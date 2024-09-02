import { signIn, useSession } from "next-auth/react";
import Link, { LinkProps } from "next/link";
import { useSearchParams } from "next/navigation";

interface NavItemProps extends LinkProps {
  children: React.ReactNode;
}

function NavItem({ children, href, ...props }: NavItemProps) {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const userRef = searchParams.get("user");

  const isPrivateAndUnauthenticated =
    !userRef &&
    status === "unauthenticated" &&
    href !== "/guide" &&
    href !== "/scorer";

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
        className="block rounded-md p-3 font-normal transition-colors hover:bg-secondary"
      >
        {children}
      </Link>
    </li>
  );
}

export default NavItem;
