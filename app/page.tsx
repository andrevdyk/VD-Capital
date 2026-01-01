import HeroSection from "@/components/homepage/hero-section";
import SideBySide from "@/components/homepage/side-by-side";
import MarketingCards from "@/components/homepage/marketing-cards";
import {AccordionComponent} from "@/components/homepage/accordion-component";
import PageWrapper from "@/components/wrapper/page-wrapper";
import config from "@/config";

export default function Home() {
  return (
    <PageWrapper>
      {/* Hero - exactly 100vh, no extra spacing */}
      <HeroSection />

      {/* Everything below has solid black background */}
      <div className="bg-[#0a0a0a] w-full flex flex-col items-center">

        <div className="flex flex-col p-2 w-full justify-center items-center">
          <MarketingCards />
        </div>

        {(config.auth.enabled && config.payments.enabled) && <div>{/* Pricing */}</div>}

        <div className="flex justify-center items-center w-full my-[8rem]">
          <AccordionComponent />
        </div>
      </div>
    </PageWrapper>
  );
}