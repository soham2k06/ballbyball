import { signIn } from "next-auth/react";
import Link, { LinkProps } from "next/link";

interface NavItemProps extends LinkProps {
  children: React.ReactNode;
}

function NavItem({ children, href, ...props }: NavItemProps) {
  return (
    <li
      onClick={() => {
        if (href === "/") signIn("google");
      }}
    >
      <Link
        href={href}
        {...props}
        className="block rounded-md p-3 font-normal transition-colors hover:bg-secondary"
      >
        {children}
      </Link>
    </li>
  );
}

export default NavItem;
