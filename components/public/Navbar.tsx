"use client"

import { Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from "react";
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import ThemeToggle from '@components/common/ThemeToggle';
import UserMenu from '@components/common/UserMenu';
import LanguageSwitcher from '@components/common/LanguageSwitcher';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const t = useTranslations('Navbar');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      setScrolled(scrollPosition > 50);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('home'), href: '#home' },
    { name: t('research'), href: '#research' },
    { name: t('team'), href: '#team' },
    { name: t('publications'), href: '#publications' },
    { name: t('contact'), href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 py-3 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-lab-black/40 backdrop-blur-md border-b border-lab-white/10' : 'bg-transparent border-b border-transparent'}`}>
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
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-baseline space-x-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative uppercase px-2 py-1 text-md font-medium text-lab-gray-400 hover:text-lab-white transition-colors group whitespace-nowrap"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lab-yellow transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>
            <ThemeToggle />
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-3">
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
        <div className="lg:hidden bg-lab-black/95 backdrop-blur-xl border-b border-lab-white/10">
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
            
            {/* User Menu Mobile */}
            <div className="border-t border-lab-white/10 mt-3 pt-3">
              {status === 'loading' ? (
                <div className="px-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-lab-gray-200/50 animate-pulse border border-lab-white/10" />
                </div>
              ) : session?.user ? (
                <>
                  <div className="px-3 py-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-lab-blue to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {session.user.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1">
                        <p className="text-lab-white text-sm font-bold">
                          {session.user.name}
                        </p>
                        <p className="text-lab-gray-400 text-xs">
                          Administrador
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-2 text-lab-white hover:text-lab-blue hover:bg-lab-white/5 rounded-md transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    <span className="text-base font-medium">Panel Administrativo</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all mt-1"
                  >
                    <LogOut size={18} />
                    <span className="text-base font-medium">Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-2 text-lab-white hover:text-lab-yellow hover:bg-lab-white/5 rounded-md transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={18} />
                  <span className="text-base font-medium">{t('login')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}