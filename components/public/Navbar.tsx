"use client"

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from "react";
import ThemeToggle from '@components/common/ThemeToggle';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#home' },
    { name: 'Investigación', href: '#research' },
    { name: 'Equipo', href: '#team' },
    { name: 'Publicaciones', href: '#publications' },
    { name: 'Galería', href: '#gallery' },
    { name: 'Contacto', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 py-3 w-full z-50 transition-all duration-300 border-lab-white/0 ${scrolled ? 'bg-lab-black/90 backdrop-blur-md border-b  border-lab-white/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="#home" className="shrink-0 flex items-center gap-2 group cursor-pointer" aria-label="Ir a inicio">
            <div className="relative h-16">
              {/* Glow effect - blurred duplicate */}
              <Image 
                src="/assets/logos/logo.webp" 
                alt="" 
                width={64} 
                height={64} 
                priority
                className="absolute inset-0 opacity-0 blur-md group-hover:opacity-70 transition-opacity duration-500"
                aria-hidden="true"
              />
              {/* Main logo */}
              <Image 
                src="/assets/logos/logo.webp" 
                alt="Logo LISTER" 
                width={64} 
                height={64} 
                priority
                className="relative z-10 h-16 w-auto object-contain transition-all duration-300 group-hover:brightness-110"
              />
            </div>
            <span className="font-serif font-bold text-2xl tracking-widest text-lab-white group-hover:text-lab-yellow transition-colors">
              LISTER
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative uppercase px-2 py-1 text-lg font-medium text-lab-gray-400 hover:text-lab-white transition-colors group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lab-yellow transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-lab-white hover:text-lab-yellow focus:outline-none focus:ring-2 focus:ring-lab-yellow focus:ring-offset-2 focus:ring-offset-lab-black rounded-md p-2"
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-lab-black/95 backdrop-blur-xl border-b border-lab-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-lab-white hover:text-lab-yellow hover:bg-lab-white/5"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}