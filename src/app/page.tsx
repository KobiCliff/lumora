import Hero from "@/components/sections/Hero";   // ← we’ll create this in 10 seconds
import Features from "@/components/sections/Features";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      {/* Dashboard is now at /dashboard — we’ll link to it from the hero */}
    </>
  );
}