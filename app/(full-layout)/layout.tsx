import { Suspense } from "react";

import getSession from "@/lib/auth/session";

import Footer from "@/components/footer";
import Nav from "@/components/nav";

async function AsyncNav() {
  const session = await getSession();

  return <Nav session={session} />;
}

function SuspensedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <Suspense fallback={<Nav session={null} loading />}>
        <AsyncNav />
      </Suspense>
      <div className="flex h-full flex-col justify-between overflow-y-auto">
        <main className="mx-auto w-full max-w-7xl p-4">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export default SuspensedLayout;
