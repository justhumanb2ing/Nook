import FeatureSection from "@/components/landing/feature-section";
import FooterSection from "@/components/landing/footer-section";
import HeroSection from "@/components/landing/hero-section";
import PricingSection from "@/components/landing/pricing-section";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/metadata-config";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.title,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.locale,
    publisher: {
      "@type": "Organization",
      name: siteConfig.title,
      url: siteConfig.url,
      logo: siteConfig.author.photo,
    },
  };

  return (
    <div className="h-dvh w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <HeroSection />
      <FeatureSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
}
