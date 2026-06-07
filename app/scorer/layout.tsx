import Footer from "@/components/footer";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full flex-col items-center overflow-y-auto">
      <div className="my-auto w-full">
        <div className="flex h-full w-full items-center justify-center">{children}</div>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
