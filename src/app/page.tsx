import { HeroSection } from "@/components/home/hero-section";
import { ServiceMatrix } from "@/components/home/service-matrix";
import { SustainabilitySection } from "@/components/home/sustainability-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Gold separator */}
      <div className="flex items-center justify-center py-4">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      <ServiceMatrix />

      {/* Burgundy separator */}
      <div className="flex items-center justify-center py-4">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-burgundy/20 to-transparent" />
      </div>

      <SustainabilitySection />
    </>
  );
}
