import { Header } from "@/components/layout/header";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { WhatsappFab } from "@/components/layout/whatsapp-fab";
import { Business } from "@/components/sections/business";
import { Commitment } from "@/components/sections/commitment";
import { Contact } from "@/components/sections/contact";
import { Coverage } from "@/components/sections/coverage";
import { Ecosystem } from "@/components/sections/ecosystem";
import { Hero } from "@/components/sections/hero";
import { KillaTV } from "@/components/sections/killa-tv";
import { Marquee } from "@/components/sections/marquee";
import { Plans } from "@/components/sections/plans";
import { StatsBand } from "@/components/sections/stats-band";
import { RevealOnScroll } from "@/components/visual/reveal-on-scroll";
import { ViewportHeightSync } from "@/components/visual/viewport-height-sync";

export default function Home() {
  return (
    <>
      <RevealOnScroll />
      <ViewportHeightSync />
      <Header />
      <main>
        <Hero />
        <StatsBand />
        <Ecosystem />
        <Plans />
        <Business />
        <Coverage />
        <Marquee />
        <KillaTV />
        <Commitment />
      </main>
      <Contact />
      <ScrollToTop />
      <WhatsappFab />
    </>
  );
}
