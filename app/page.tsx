import { Header } from "@/components/layout/header";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { WhatsappFab } from "@/components/layout/whatsapp-fab";
import { About } from "@/components/sections/about";
import { Business } from "@/components/sections/business";
import { Contact } from "@/components/sections/contact";
import { Coverage } from "@/components/sections/coverage";
import { Ecosystem } from "@/components/sections/ecosystem";
import { Hero } from "@/components/sections/hero";
import { KillaTV } from "@/components/sections/killa-tv";
import { Marquee } from "@/components/sections/marquee";
import { Plans } from "@/components/sections/plans";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { RevealOnScroll } from "@/components/visual/reveal-on-scroll";
import { ViewportHeightSync } from "@/components/visual/viewport-height-sync";

export default function Home() {
  return (
    <>
      <RevealOnScroll />
      <ViewportHeightSync />
      <SmoothScroll />
      <Header />
      <main>
        <Hero />
        <About />
        <Ecosystem />
        <Plans />
        <Business />
        <Coverage />
        <Marquee />
        <KillaTV />
      </main>
      <Contact />
      <ScrollToTop />
      <WhatsappFab />
    </>
  );
}
