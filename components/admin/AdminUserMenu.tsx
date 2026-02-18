'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, Shield, ChevronDown, LayoutDashboard, Home } from 'lucide-react';
import { useState } from 'react';

export default function AdminUserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="w-10 h-10 rounded-full bg-lab-gray-200/50 animate-pulse border border-lab-white/10" />
    );
  }

  if (session?.user) {
    return (
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-lab-gray-200/50 backdrop-blur-sm border border-lab-white/10 hover:border-lab-blue/50 hover:bg-lab-gray-200 transition-all group"
        >
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-lab-blue to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-lab-blue/20 group-hover:shadow-lab-blue/40 transition-shadow">
            {session.user.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="text-lab-white text-sm font-semibold hidden lg:block">
            {session.user.name}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-lab-gray-400 hidden lg:block transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown */}
        <div className={`absolute right-0 mt-2 w-64 bg-lab-gray-100/95 backdrop-blur-xl border border-lab-white/10 rounded-xl shadow-2xl transition-all duration-200 z-50 ${
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}>
          {/* User Info */}
          <div className="p-4 border-b border-lab-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-lab-blue to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {session.user.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lab-white text-base font-bold truncate">
                  {session.user.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Shield size={12} className="text-lab-blue" />
                  <p className="text-lab-gray-400 text-xs font-medium">
                    Administrador
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="p-2">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-lab-white hover:text-lab-blue hover:bg-lab-white/5 rounded-lg transition-all text-sm font-medium group"
              onClick={() => setIsOpen(false)}
            >
              <Home size={16} className="group-hover:scale-110 transition-transform" />
              Ver Sitio Web
            </Link>
            <Link
              href="/admin"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-lab-white hover:text-lab-blue hover:bg-lab-white/5 rounded-lg transition-all text-sm font-medium group"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard size={16} className="group-hover:scale-110 transition-transform" />
              Dashboard
            </Link>
          </div>

          <div className="border-t border-lab-white/10 p-2">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium group"
            >
              <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
              Cerrar Sesión
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-lab-white/10 bg-lab-gray-200/30">
            <p className="text-lab-gray-400 text-xs text-center">
              Panel Administrativo LISTER
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
