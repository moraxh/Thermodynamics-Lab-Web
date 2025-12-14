"use client"

import Button from "@components/common/Button";
import { ChevronRight, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

export default function Hero() {
  const [text, setText] = useState('');
  const fullText = "Innovación en Termodinámica y Sistemas Complejos";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-lab-black">
      
      {/* Background Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(59_130_246)_1px,transparent_1px),linear-gradient(to_bottom,rgb(59_130_246)_1px,transparent_1px)] bg-size-[4rem_4rem] h-[200vh] origin-top" />
      </div>

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-lab-black)_70%)] z-0" />

      {/* Floating Particles */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-lab-yellow rounded-full shadow-[0_0_10px_rgb(246_195_8)]"
        animate={{
          y: [-20, 20],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute top-3/4 right-1/3 w-1 h-1 bg-lab-blue rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "mirror",
          delay: 0.7,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-lab-white/20 rounded-full blur-sm"
        animate={{
          x: [-10, 10],
          y: [-10, 10],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          className="inline-block mb-4 px-4 py-1 rounded-full border border-lab-blue/30 bg-lab-blue/10 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="text-lab-yellow text-xs font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lab-yellow animate-ping"></span>
            Laboratorio de Vanguardia
          </span>
        </motion.div>
        
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-lab-white mb-6 tracking-tight leading-tight px-4 md:px-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          EL FUTURO DE LA <br/>
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-lab-blue via-lab-white to-lab-blue animate-gradient bg-size-[200%_auto]">
              ENERGÍA
            </span>
            {/* Subtle glow effect */}
            <span className="absolute inset-0 text-lab-yellow opacity-0 blur-sm" aria-hidden="true">ENERGÍA</span>
          </span>
        </motion.h1>

        <motion.div 
          className="h-16 md:h-12 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-base md:text-xl text-lab-gray-400 font-mono px-4 md:px-0">
            {text}<span className="inline-block w-0.5 h-5 md:h-6 bg-lab-yellow ml-1 animate-pulse" />
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mt-8 px-4 md:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <a href="#research">
            <Button variant="accent" icon={<ChevronRight size={18} />}>
              Explorar Investigación
            </Button>
          </a>
          <a href="#publications">
            <Button variant="outline" icon={<Zap size={18} />}>
              Nuestra Tecnología
            </Button>
          </a>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <a href="#research" className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer">
        <motion.div 
          className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="text-xs uppercase tracking-widest text-lab-gray-400">Scroll</span>
          <div className="w-px h-12 bg-linear-to-b from-lab-yellow to-transparent"></div>
        </motion.div>
      </a>
    </section>
  );
}