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
import Aurora from '@/components/Aurora';

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Aurora Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <Aurora
          colorStops={['#1e293b', '#10b981', '#1e293b']}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
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
    </div>
  );
}
