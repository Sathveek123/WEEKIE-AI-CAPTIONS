import { HeroSection } from "~/components/landing/hero-section";
import { FeaturesSection } from "~/components/landing/features-section";
import { InteractiveStudioSection } from "~/components/landing/interactive-studio-section";
import { HowItWorksSection } from "~/components/landing/how-it-works-section";
import { PresetsShowcaseSection } from "~/components/landing/presets-showcase-section";
import { PricingSection } from "~/components/landing/pricing-section";
import { FAQSection } from "~/components/landing/faq-section";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF5]">
      <HeroSection />
      <FeaturesSection />
      <InteractiveStudioSection />
      <HowItWorksSection />
      <PresetsShowcaseSection />
      <PricingSection />
      <FAQSection />
    </div>
  );
}
