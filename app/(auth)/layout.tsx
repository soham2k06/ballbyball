function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-primary-foreground">
      {children}
    </main>
  );
}

export default Layout;
