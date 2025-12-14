'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, Globe2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'pt', name: 'Português', flag: 'PT' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'it', name: 'Italiano', flag: 'IT' },
  { code: 'zh', name: '中文', flag: 'ZH' },
  { code: 'ja', name: '日本語', flag: 'JA' },
  { code: 'ko', name: '한국어', flag: 'KO' },
  { code: 'ar', name: 'العربية', flag: 'AR' },
  { code: 'ru', name: 'Русский', flag: 'RU' }
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    setIsOpen(false);
    
    // Save locale to localStorage
    localStorage.setItem('locale', newLocale);
    
    // Replace the locale in the pathname
    const segments = pathname.split('/');
    const validLocales = languages.map(lang => lang.code);
    
    // Check if first segment (after /) is a valid locale
    if (segments[1] && validLocales.includes(segments[1])) {
      // Replace locale in path
      segments[1] = newLocale;
      router.push(segments.join('/'));
    } else {
      // Navigate to home with new locale
      router.push(`/${newLocale}`);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40" ref={dropdownRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-56 bg-lab-gray-100/95 backdrop-blur-xl border border-lab-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[60vh]"
          >
            <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(60vh-16px)] scrollbar-thin scrollbar-thumb-lab-blue/50 scrollbar-track-transparent">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    lang.code === locale
                      ? 'bg-lab-blue/20 text-lab-blue'
                      : 'text-lab-white hover:bg-lab-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xl font-bold text-lab-blue leading-none">{lang.flag}</span>
                  <div className="flex-1">
                    <p className="font-semibold leading-tight">{lang.name}</p>
                  </div>
                  {lang.code === locale && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-lab-blue"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-lab-blue to-lab-purple blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
        
        {/* Button */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-lab-blue to-blue-600 border-2 border-lab-white/20 shadow-lg flex items-center justify-center backdrop-blur-sm group-hover:border-lab-white/40 transition-all">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Globe2 className="w-6 h-6 text-white" />
          </motion.div>
          
          {/* Badge with flag */}
          <motion.div
            className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-lab-blue flex items-center justify-center text-xs font-bold text-lab-blue shadow-lg"
            animate={{ scale: isOpen ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {currentLanguage.flag}
          </motion.div>
        </div>
      </motion.button>
    </div>
  );
}
