import { Suspense } from "react";

import getSession from "@/lib/auth/session";

import Footer from "@/components/footer";
import Nav from "@/components/nav";
import { Provider } from "@/components/providers";

async function AsyncNav() {
  const session = await getSession();

  return <Nav session={session} />;
}

function SuspensedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      attribute="class"
      enableSystem
      defaultTheme="system"
      disableTransitionOnChange
    >
      <div className="flex h-dvh flex-col">
        <Suspense fallback={<Nav session={null} loading />}>
          <AsyncNav />
        </Suspense>
        <div className="mb-auto flex p-4">
          <main className="mx-auto w-full max-w-7xl overflow-hidden">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </Provider>
  );
}

export default SuspensedLayout;
