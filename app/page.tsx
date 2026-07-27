import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { TrustedBy } from '@/components/landing/trusted-by';
import { PlatformOverview } from '@/components/landing/platform-overview';
import { GstShowcase } from '@/components/landing/gst-showcase';
import { AccountingSection } from '@/components/landing/accounting-section';
import { WhyAccountIn } from '@/components/landing/why-accountin';
import { IndustryReadiness } from '@/components/landing/industry-readiness';
import { PartnerProgram } from '@/components/landing/partner-program';
import { PlatformDemo } from '@/components/landing/platform-demo';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Testimonials } from '@/components/landing/testimonials';
import { Pricing } from '@/components/landing/pricing';
import { Faq } from '@/components/landing/faq';
import { Contact } from '@/components/landing/contact';
import { Footer } from '@/components/landing/footer';
import { PremiumHeroBackground } from '@/components/landing/ui/premium-hero-background';

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-x-hidden hero-theme-orange">
      <PremiumHeroBackground />
      <Navbar />
      <Hero />
      <TrustedBy />
      <PlatformOverview />
      <GstShowcase />
      <AccountingSection />
      <WhyAccountIn />
      <IndustryReadiness />
      <PartnerProgram />
      <PlatformDemo />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Faq />
      <Contact />
      <Footer />
    </main>
  );
}
