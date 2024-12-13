import { Suspense } from "react";

import getSession from "@/lib/auth/session";

import Nav from "@/components/nav";

async function AsyncNav() {
  const session = await getSession();

  return <Nav session={session} />;
}

function SuspensedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Suspense fallback={<Nav session={null} loading />}>
        <AsyncNav />
      </Suspense>

      <main className="mx-auto w-full max-w-7xl p-4">{children}</main>
    </div>
  );
}

export default SuspensedLayout;
