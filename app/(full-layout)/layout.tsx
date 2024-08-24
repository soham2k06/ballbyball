import { Provider } from "@/components/Provider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      attribute="class"
      enableSystem
      defaultTheme="system"
      disableTransitionOnChange
    >
      <div className="flex h-dvh flex-col overflow-hidden">
        <Nav />
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

export default Layout;
