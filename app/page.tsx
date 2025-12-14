"use client"

import Contact from "@components/public/Contact";
import Footer from "@components/public/Footer";
import Gallery from "@components/public/Gallery";
import Hero from "@components/public/Hero";
import NavBar from "@components/public/Navbar";
import Publications from "@components/public/Publications";
import Research from "@components/public/Research";
import Team from "@components/public/Team";

export default function Home() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <Research />
        <Team />
        <Publications />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
