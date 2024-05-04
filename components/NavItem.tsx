import Link, { LinkProps } from "next/link";

interface NavItemProps extends LinkProps {
  children: React.ReactNode;
}

function NavItem({ children, href, ...props }: NavItemProps) {
  return (
    <li>
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
