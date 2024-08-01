import Footer from "@/components/Footer";
import { Provider } from "@/components/Provider";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      attribute="class"
      enableSystem
      defaultTheme="system"
      disableTransitionOnChange
    >
      <div className="mb-16 p-4">{children}</div>
      <Footer />
    </Provider>
  );
}

export default Layout;
