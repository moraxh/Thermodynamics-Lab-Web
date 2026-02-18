"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';

interface GalleryImage {
  id: string;
  path: string;
  uploadedAt: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    zIndex: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 1
  })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function Gallery() {
  const t = useTranslations('Gallery');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [[page, direction], setPage] = useState([0, 0]);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          setImages(data.data || []);
        }
      } catch {
        // Error fetching gallery images
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Preload all images when they are loaded
  useEffect(() => {
    if (images.length > 0) {
      images.forEach((image) => {
        const img = new window.Image();
        img.src = image.path;
      });
    }
  }, [images]);

  const showEmptyState = !loading && images.length === 0;
  const imageIndex = images.length > 0 ? ((page % images.length) + images.length) % images.length : 0;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const goToSlide = (index: number) => {
    const newDirection = index > imageIndex ? 1 : -1;
    setPage([index, newDirection]);
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-lab-gray-100 relative border-t border-lab-white/5 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Header */}
        <motion.div 
          className="text-center mb-16 overflow-x-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {loading ? (
            <div className="relative aspect-video overflow-hidden rounded-xl bg-lab-gray-200 border border-lab-white/10 flex items-center justify-center min-h-[280px] md:min-h-[480px]">
              <div className="w-12 h-12 border-4 border-lab-gray-400/30 border-t-lab-yellow rounded-full animate-spin" />
            </div>
          ) : showEmptyState ? (
            <motion.div 
              className="relative aspect-video overflow-hidden rounded-xl bg-lab-gray-200 border border-lab-white/10 flex flex-col items-center justify-center p-4 sm:p-8 min-h-[280px] md:min-h-[480px]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-4 sm:mb-6"
              >
                <div className="relative">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl bg-lab-gray-300/50 border-2 border-dashed border-lab-gray-400 flex items-center justify-center">
                    <span className="text-2xl sm:text-4xl">📸</span>
                  </div>
                  <motion.div
                    className="absolute -right-2 -top-2 sm:-right-3 sm:-top-3 w-8 h-8 sm:w-12 sm:h-12 bg-lab-yellow rounded-full flex items-center justify-center text-lg sm:text-2xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    🔍
                  </motion.div>
                </div>
              </motion.div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-lab-white mb-2 sm:mb-3 px-4">{t('emptyTitle')}</h3>
              <p className="text-lab-gray-400 text-center max-w-xl text-sm sm:text-base md:text-lg px-4">
                {t('emptySubtitle')}
                <br />
                <span className="text-lab-yellow">{t('emptyDetail')}</span>
              </p>
            </motion.div>
          ) : (
            <>
              <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-lab-gray-200 border border-lab-white/10 min-h-[280px] md:min-h-[480px] touch-pan-y isolate">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={page}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 500, damping: 50 },
                      opacity: { duration: 0.1 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = swipePower(offset.x, velocity.x);

                      if (swipe < -swipeConfidenceThreshold) {
                        paginate(1);
                      } else if (swipe > swipeConfidenceThreshold) {
                        paginate(-1);
                      }
                    }}
                    className="absolute inset-0 group cursor-grab active:cursor-grabbing will-change-transform"
                  >
                    <Image
                      src={images[imageIndex].path}
                      alt={`Imagen de galería ${imageIndex + 1}`}
                      fill
                      className="object-cover transition-all duration-700 pointer-events-none"
                      onClick={() => setLightboxImage(images[imageIndex])}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1536px"
                    />
                    
                    {/* Corner Accents */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-lab-yellow pointer-events-none" />
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-lab-yellow pointer-events-none" />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => paginate(-1)}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-lab-black/50 hover:bg-lab-yellow/90 backdrop-blur-sm flex items-center justify-center text-white hover:text-lab-black transition-all duration-300 border border-lab-white/10 hover:border-lab-yellow group/btn z-10"
                      aria-label={t('previous')}
                    >
                      <ChevronLeft size={20} className="sm:w-6 sm:h-6 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    
                    <button
                      onClick={() => paginate(1)}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-lab-black/50 hover:bg-lab-yellow/90 backdrop-blur-sm flex items-center justify-center text-white hover:text-lab-black transition-all duration-300 border border-lab-white/10 hover:border-lab-yellow group/btn z-10"
                      aria-label={t('next')}
                    >
                      <ChevronRight size={20} className="sm:w-6 sm:h-6 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-6 overflow-x-hidden">
                  <motion.div 
                    className="px-4 sm:px-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-lab-gray-400 scrollbar-track-lab-gray-200 scroll-smooth snap-x snap-mandatory">
                    {images.map((image, index) => (
                      <motion.button
                        key={image.id}
                        onClick={() => goToSlide(index)}
                        className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 overflow-hidden rounded-lg border-2 transition-all duration-300 snap-start ${
                          index === imageIndex
                            ? 'border-lab-yellow shadow-[0_0_15px_rgb(246_195_8/0.5)]'
                            : 'border-lab-white/10 hover:border-lab-blue/50 opacity-60 hover:opacity-100'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Image
                          src={image.path}
                          alt={`Miniatura ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                          loading="lazy"
                        />
                      </motion.button>
                    ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Dots Indicator */}
              {images.length > 1 && (
                <div className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 px-4">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 ${
                        index === imageIndex
                          ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-lab-yellow shadow-[0_0_10px_rgb(246_195_8/0.5)]'
                          : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-lab-gray-400 hover:bg-lab-blue'
                      } rounded-full`}
                      aria-label={`Ir a imagen ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div 
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
              onClick={() => setLightboxImage(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
            <motion.button
              onClick={() => setLightboxImage(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-lab-yellow/90 flex items-center justify-center text-white hover:text-lab-black transition-colors z-10"
              aria-label="Cerrar"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </motion.button>
            
            <motion.div 
              className="relative max-w-5xl w-full h-[70vh] sm:h-[80vh]" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <Image
                src={lightboxImage.path}
                alt={`Imagen de galería`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </section>
  );
}
