'use client';

import { useEffect } from 'react';

/**
 * Hook para prevenir layout shift y mantener la posición del scroll
 * al recargar la página o navegar
 */
export function useScrollRestoration() {
  useEffect(() => {
    // Deshabilitar la restauración automática del navegador
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    let scrollTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 5;

    // Función para guardar la posición del scroll
    const saveScrollPosition = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
      sessionStorage.setItem('scrollSaveTime', Date.now().toString());
    };

    // Función para restaurar la posición del scroll con reintentos
    const attemptScrollRestore = (targetPosition: number) => {
      requestAnimationFrame(() => {
        window.scrollTo(0, targetPosition);
        
        // Verificar si llegamos a la posición correcta
        requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          const diff = Math.abs(currentScroll - targetPosition);
          
          // Si no estamos en la posición correcta y tenemos reintentos
          if (diff > 10 && retryCount < maxRetries) {
            retryCount++;
            scrollTimeout = setTimeout(() => attemptScrollRestore(targetPosition), 100);
          } else {
            // Limpiar después de restaurar exitosamente
            sessionStorage.removeItem('scrollPosition');
            sessionStorage.removeItem('scrollSaveTime');
          }
        });
      });
    };

    // Función para restaurar la posición del scroll
    const restoreScrollPosition = () => {
      const savedPosition = sessionStorage.getItem('scrollPosition');
      const saveTime = sessionStorage.getItem('scrollSaveTime');
      
      // Solo restaurar si se guardó en los últimos 30 segundos
      if (savedPosition && saveTime) {
        const timeDiff = Date.now() - parseInt(saveTime);
        if (timeDiff < 30000) {
          const targetPosition = parseInt(savedPosition);
          
          // Esperar a que las imágenes y contenido se carguen
          const waitForImages = () => {
            const images = Array.from(document.images);
            const imagePromises = images.map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise(resolve => {
                img.addEventListener('load', resolve);
                img.addEventListener('error', resolve);
                // Timeout de seguridad
                setTimeout(resolve, 3000);
              });
            });

            Promise.all(imagePromises).then(() => {
              // Esperar un frame adicional para asegurar el layout
              scrollTimeout = setTimeout(() => {
                attemptScrollRestore(targetPosition);
              }, 200);
            });
          };

          // Si el DOM ya está listo, restaurar de inmediato
          if (document.readyState === 'complete') {
            waitForImages();
          } else {
            window.addEventListener('load', waitForImages);
          }
        }
      }
    };

    // Restaurar al cargar
    restoreScrollPosition();

    // Guardar antes de recargar/salir
    window.addEventListener('beforeunload', saveScrollPosition);

    // Guardar periódicamente durante el scroll (por si el navegador crashea)
    let scrollSaveTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollSaveTimeout);
      scrollSaveTimeout = setTimeout(saveScrollPosition, 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (scrollSaveTimeout) clearTimeout(scrollSaveTimeout);
    };
  }, []);
}
