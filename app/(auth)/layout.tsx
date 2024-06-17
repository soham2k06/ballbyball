import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black">
      <ClerkLoading>
        <div className="text-white">Auth Loading...</div>
      </ClerkLoading>
      <ClerkLoaded>
        {children}
      </ClerkLoaded>
    </main>
  );
}

export default Layout;
