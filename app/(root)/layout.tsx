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
      <Nav />
      <div className=" px-4 py-4">
        <div className="mx-auto mb-16 w-full max-w-7xl flex-1">{children}</div>
      </div>
      <Footer />
    </Provider>
  );
}

export default Layout;
