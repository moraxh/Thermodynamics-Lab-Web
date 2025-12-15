"use client"

import Contact from "@components/public/Contact";
import EducationalMaterial from "@components/public/EducationalMaterial";
import Events from "@components/public/Events";
import Footer from "@components/public/Footer";
import Gallery from "@components/public/Gallery";
import Hero from "@components/public/Hero";
import NavBar from "@components/public/Navbar";
import Publications from "@components/public/Publications";
import Research from "@components/public/Research";
import Team from "@components/public/Team";
import Videos from "@components/public/Videos";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";

export default function Home() {
  useScrollRestoration();
  
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <Research />
        <Team />
        <Publications />
        <Videos />
        <EducationalMaterial />
        <Events />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
