'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Github } from 'lucide-react';
import { SITE_INFO, CREATORS } from '@/lib/constants';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  
  return (
    <footer className="bg-lab-black border-t border-lab-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          <div className="flex items-center gap-2">
            <Image 
              src="/assets/logos/logo.png" 
              alt="Logo LISTER" 
              width={120} 
              height={40}
              className="h-10 w-auto"
            />
            <span className="font-serif font-bold text-lg tracking-widest text-lab-white">
              {SITE_INFO.name}
            </span>
          </div>
          <p className="text-lab-gray-400 text-sm text-center md:text-right max-w-md">
            {t('description')}
          </p>
        </div>
        
        <div className="border-t border-lab-white/5 pt-3 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-lab-gray-400 font-mono">
            <p>&copy; {new Date().getFullYear()} {SITE_INFO.name}. {t('rights')}.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-lab-yellow transition-colors">{t('privacy')}</Link>
              <Link href="/terms" className="hover:text-lab-yellow transition-colors">{t('terms')}</Link>
              <Link href="/accessibility" className="hover:text-lab-yellow transition-colors">{t('accessibility')}</Link>
            </div>
          </div>
          
          {/* Creators Section */}
          <div className="pt-6 border-t border-lab-white/5">
            <p className="text-center text-xs text-lab-gray-400 mb-4">{t('developedBy')}</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              {CREATORS.map((creator) => (
                <a 
                  key={creator.username}
                  href={creator.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-3 rounded-lg bg-lab-gray-200/30 border border-lab-white/5 hover:border-lab-blue/50 hover:bg-lab-gray-200/50 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-lab-blue/20 flex items-center justify-center group-hover:bg-lab-blue/30 transition-colors">
                    <Github size={18} className="text-lab-blue group-hover:text-lab-yellow transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-lab-white group-hover:text-lab-yellow transition-colors">{creator.name}</p>
                    <p className="text-xs text-lab-gray-400">@{creator.username}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};