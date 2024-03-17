import Link, { LinkProps } from "next/link";

interface NavItemProps extends LinkProps {
  children: React.ReactNode;
}

function NavItem({ children, href, ...props }: NavItemProps) {
  return (
    <Link href={href} {...props}>
      <li className="rounded-md p-3 font-normal transition-colors hover:bg-secondary">
        {children}
      </li>
    </Link>
  );
}

export default NavItem;
