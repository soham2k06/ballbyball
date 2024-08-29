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
      <div className="flex h-dvh w-full flex-col items-center">
        <div className="p-4">
          <div className="flex h-full items-center">{children}</div>
        </div>
        <Footer />
      </div>
    </Provider>
  );
}

export default Layout;
