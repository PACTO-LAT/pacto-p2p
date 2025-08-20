'use client';

import {
  AssetsSection,
  BuildersSection,
  BuiltWithSection,
  CTASection,
  FeaturesSection,
  Footer,
  Header,
  HeroSection,
  HowItWorksSection,
} from '@/components/landing';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AssetsSection />
      <BuildersSection />
      <BuiltWithSection />
      <CTASection />
      <Footer />
    </div>
  );
}
