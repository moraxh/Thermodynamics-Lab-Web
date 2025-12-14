'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Users,
  Image as ImageIcon,
  FileText,
  Video,
  GraduationCap,
  Calendar,
  Home,
  Settings,
} from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/members', label: 'Miembros', icon: Users },
  { href: '/admin/gallery', label: 'Galería', icon: ImageIcon },
  { href: '/admin/publications', label: 'Publicaciones', icon: FileText },
  { href: '/admin/videos', label: 'Videos', icon: Video },
  { href: '/admin/educational-material', label: 'Material Educativo', icon: GraduationCap },
  { href: '/admin/events', label: 'Eventos', icon: Calendar },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

export default function AdminNavbar() {
  const pathname = usePathname();

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="border-b border-lab-white/10 bg-lab-gray-100/30 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          {/* Logo */}
            <Link href="/" 
            className="shrink-0 flex items-center gap-2 group py-3"
          >
            <Image 
              src="/assets/logos/logo.webp" 
              alt="LISTER Logo" 
              width={40} 
              height={40} 
              className="object-contain group-hover:brightness-110"
            />
            <motion.span 
              className="font-serif font-bold text-lg tracking-wider text-lab-white group-hover:text-lab-blue transition-colors hidden md:block"
              whileHover={{ scale: 1.05 }}
            >
              LISTER
            </motion.span>
          </Link>

          {/* Divider */}
          <motion.div 
            className="h-8 w-px bg-lab-white/10 shrink-0"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          ></motion.div>

          {/* Nav Items */}
          <div className="flex items-center gap-1 flex-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Link
                    href={item.href}
                    className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-300 group ${
                      isActive
                        ? 'text-lab-white bg-lab-blue/20'
                        : 'text-lab-gray-400 hover:text-lab-white hover:bg-lab-white/5'
                    }`}
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon size={16} />
                    </motion.div>
                    <span className="relative">
                      {item.label}
                      {isActive && (
                        <motion.span 
                          layoutId="activeTab"
                          className="absolute -bottom-1 left-0 w-full h-0.5 bg-lab-blue rounded-full"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        ></motion.span>
                      )}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="shrink-0 mr-2"
          >
            <ThemeToggle iconSize={18} className="hover:bg-lab-white/5" />
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
