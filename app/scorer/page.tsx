import Footer from "@/components/Footer";
import ScorerLayout from "@/components/scorer/ScorerLayout";

export default function Home() {
  return (
    <>
      <div className="flex h-full flex-col items-center md:justify-center">
        <ScorerLayout />
      </div>
      <Footer />
    </>
  );
}
