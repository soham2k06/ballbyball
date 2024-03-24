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
      <div className="mx-auto max-w-7xl max-xl:p-4">{children}</div>
      <Footer />
    </Provider>
  );
}

export default Layout;
