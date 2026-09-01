import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import ProblemSolution from "@/components/sections/ProblemSolution";
import HowItWorks from "@/components/sections/HowItWorks";
import WhoItsFor from "@/components/sections/WhoItsFor";
import Features from "@/components/sections/Features";
import FAQ from "@/components/sections/FAQ";
import FinalCta from "@/components/sections/FinalCta";

export default function HomePage() {
  return (
    <>
      <Nav />
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <WhoItsFor />
      <Features />
      <FAQ />
      <FinalCta />
    </>
  );
}
