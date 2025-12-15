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
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
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
      } catch (error) {
        // Error fetching gallery images
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

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
    <section id="gallery" className="py-16 md:py-24 bg-lab-gray-100 relative border-t border-lab-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {loading ? (
            <div className="relative aspect-video overflow-hidden rounded-xl bg-lab-gray-200 border border-lab-white/10 flex items-center justify-center min-h-[480px]">
              <div className="w-12 h-12 border-4 border-lab-gray-400/30 border-t-lab-yellow rounded-full animate-spin" />
            </div>
          ) : showEmptyState ? (
            <motion.div 
              className="relative aspect-video overflow-hidden rounded-xl bg-lab-gray-200 border border-lab-white/10 flex flex-col items-center justify-center p-8 min-h-[480px]"
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
                className="mb-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl bg-lab-gray-300/50 border-2 border-dashed border-lab-gray-400 flex items-center justify-center">
                    <span className="text-4xl">📸</span>
                  </div>
                  <motion.div
                    className="absolute -right-3 -top-3 w-12 h-12 bg-lab-yellow rounded-full flex items-center justify-center text-2xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    🔍
                  </motion.div>
                </div>
              </motion.div>
              <h3 className="text-3xl font-bold text-lab-white mb-3">{t('emptyTitle')}</h3>
              <p className="text-lab-gray-400 text-center max-w-xl text-lg">
                {t('emptySubtitle')}
                <br />
                <span className="text-lab-yellow">{t('emptyDetail')}</span>
              </p>
            </motion.div>
          ) : (
            <>
              <div className="relative aspect-video overflow-hidden rounded-xl bg-lab-gray-200 border border-lab-white/10">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={page}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = swipePower(offset.x, velocity.x);

                      if (swipe < -swipeConfidenceThreshold) {
                        paginate(1);
                      } else if (swipe > swipeConfidenceThreshold) {
                        paginate(-1);
                      }
                    }}
                    className="absolute inset-0 group cursor-grab active:cursor-grabbing"
                  >
                    <Image
                      src={images[imageIndex].path}
                      alt={`Imagen de galería ${imageIndex + 1}`}
                      fill
                      className="object-cover transition-all duration-700 pointer-events-none"
                      onClick={() => setLightboxImage(images[imageIndex])}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    />
                    
                    {/* Corner Accents */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-lab-yellow pointer-events-none" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-lab-yellow pointer-events-none" />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => paginate(-1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-lab-black/50 hover:bg-lab-yellow/90 backdrop-blur-sm flex items-center justify-center text-white hover:text-lab-black transition-all duration-300 border border-lab-white/10 hover:border-lab-yellow group/btn z-10"
                      aria-label={t('previous')}
                    >
                      <ChevronLeft size={24} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                    
                    <button
                      onClick={() => paginate(1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-lab-black/50 hover:bg-lab-yellow/90 backdrop-blur-sm flex items-center justify-center text-white hover:text-lab-black transition-all duration-300 border border-lab-white/10 hover:border-lab-yellow group/btn z-10"
                      aria-label={t('next')}
                    >
                      <ChevronRight size={24} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <motion.div 
                  className="mt-6 flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-lab-gray-400 scrollbar-track-lab-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {images.map((image, index) => (
                    <motion.button
                      key={image.id}
                      onClick={() => goToSlide(index)}
                      className={`relative flex-shrink-0 w-24 h-24 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
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
                        sizes="96px"
                        loading="lazy"
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Dots Indicator */}
              {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 ${
                        index === imageIndex
                          ? 'w-8 h-2 bg-lab-yellow shadow-[0_0_10px_rgb(246_195_8/0.5)]'
                          : 'w-2 h-2 bg-lab-gray-400 hover:bg-lab-blue'
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
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setLightboxImage(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
            <motion.button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-lab-yellow/90 flex items-center justify-center text-white hover:text-lab-black transition-colors"
              aria-label="Cerrar"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <X size={24} />
            </motion.button>
            
            <motion.div 
              className="relative max-w-5xl w-full h-[80vh]" 
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
