'use client';

import { useEffect } from 'react';

export default function ViewTransition({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Verificar si el navegador soporta View Transitions
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const handleLinkClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        
        if (link && link.href && link.target !== '_blank') {
          const url = new URL(link.href);
          if (url.origin === window.location.origin) {
            e.preventDefault();
            
            // @ts-ignore
            document.startViewTransition(() => {
              window.history.pushState({}, '', url);
              window.dispatchEvent(new PopStateEvent('popstate'));
            });
          }
        }
      };

      document.addEventListener('click', handleLinkClick);
      return () => document.removeEventListener('click', handleLinkClick);
    }
  }, []);

  return <>{children}</>;
}
