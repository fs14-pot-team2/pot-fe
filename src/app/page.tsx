import PageMain from "@/components/layout/Page/PageMain";
import CareTypeSection from "@/features/landing/components/CareTypeSection/CareTypeSection";
import FinalCtaSection from "@/features/landing/components/FinalCtaSection/FinalCtaSection";
import HeroSection from "@/features/landing/components/HeroSection/HeroSection";
import PartnersSection from "@/features/landing/components/PartnersSection/PartnersSection";
import PlantGrowthSection from "@/features/landing/components/PlantGrowthSection/PlantGrowthSection";
import QuoteSection from "@/features/landing/components/QuoteSection/QuoteSection";

export default function Home() {
  return (
    <PageMain variant="fullWidth">
      <HeroSection />
      <CareTypeSection />
      <PlantGrowthSection />
      <PartnersSection />
      <QuoteSection />
      <FinalCtaSection />
    </PageMain>
  );
}
