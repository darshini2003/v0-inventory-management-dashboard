import InteractiveHero from "@/components/ui/hero-section-nexus"
import { FeaturesSection } from "./features-section"
import { BenefitsSection } from "./benefits-section"
import { TestimonialsSection } from "./testimonials-section"
import { PricingSection } from "./pricing-section"
import { CTASection } from "./cta-section"
import { Footer } from "./footer"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <InteractiveHero />
      <FeaturesSection />
      <BenefitsSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
