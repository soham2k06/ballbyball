import { Provider } from "@/components/providers";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      attribute="class"
      enableSystem
      defaultTheme="system"
      disableTransitionOnChange
    >
      <div className="p-4">{children}</div>
    </Provider>
  );
}

export default Layout;
