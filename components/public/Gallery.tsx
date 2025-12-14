"use client"

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: '1',
    src: '/gallery/lab1.webp',
    alt: 'Laboratorio principal',
  },
  {
    id: '2',
    src: '/gallery/equipment1.webp',
    alt: 'Equipo de medición térmica',
  },
  {
    id: '3',
    src: '/gallery/research1.webp',
    alt: 'Investigación en acción',
  },
  {
    id: '4',
    src: '/gallery/team1.webp',
    alt: 'Equipo de trabajo',
  },
  {
    id: '5',
    src: '/gallery/lab2.webp',
    alt: 'Área de experimentación',
  },
  {
    id: '6',
    src: '/gallery/equipment2.webp',
    alt: 'Sistema de refrigeración',
  },
];

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
  const [[page, direction], setPage] = useState([0, 0]);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const imageIndex = ((page % GALLERY_IMAGES.length) + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;

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
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
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
                  src={GALLERY_IMAGES[imageIndex].src}
                  alt={GALLERY_IMAGES[imageIndex].alt}
                  fill
                  className="object-cover transition-all duration-700 grayscale group-hover:grayscale-0 pointer-events-none"
                  onClick={() => setLightboxImage(GALLERY_IMAGES[imageIndex])}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-lab-black/80 via-transparent to-transparent pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-semibold text-lg">{GALLERY_IMAGES[imageIndex].alt}</p>
                  </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-lab-yellow pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-lab-yellow pointer-events-none" />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
              onClick={() => paginate(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-lab-black/50 hover:bg-lab-yellow/90 backdrop-blur-sm flex items-center justify-center text-white hover:text-lab-black transition-all duration-300 border border-lab-white/10 hover:border-lab-yellow group/btn z-10"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} className="group-hover/btn:scale-110 transition-transform" />
            </button>
            
            <button
              onClick={() => paginate(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-lab-black/50 hover:bg-lab-yellow/90 backdrop-blur-sm flex items-center justify-center text-white hover:text-lab-black transition-all duration-300 border border-lab-white/10 hover:border-lab-yellow group/btn z-10"
              aria-label="Siguiente"
            >
              <ChevronRight size={24} className="group-hover/btn:scale-110 transition-transform" />
            </button>
          </div>

          {/* Thumbnails */}
          <motion.div 
            className="mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {GALLERY_IMAGES.map((image, index) => (
              <motion.button
                key={image.id}
                onClick={() => goToSlide(index)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                  index === imageIndex
                    ? 'border-lab-yellow shadow-[0_0_15px_rgb(246_195_8/0.5)]'
                    : 'border-lab-white/10 hover:border-lab-blue/50 opacity-60 hover:opacity-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </motion.button>
            ))}
          </motion.div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {GALLERY_IMAGES.map((_, index) => (
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
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                fill
                className="object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6">
                <p className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-lg font-semibold">{lightboxImage.alt}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </section>
  );
}
