"use client"

import { Eye, X, BarChart3, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface Infographic {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  categories: string[];
  uploadedAt: string;
}

export default function Infographics() {
  const t = useTranslations('Infographics');
  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxImage, setLightboxImage] = useState<Infographic | null>(null);
  
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchInfographics = async () => {
      try {
        const response = await fetch('/api/infographics');
        if (response.ok) {
          const data = await response.json();
          setInfographics(data.data || []);
        }
      } catch {
        // Error fetching infographics
      } finally {
        setLoading(false);
      }
    };

    fetchInfographics();
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const filteredInfographics = activeCategory === 'ALL' 
    ? infographics 
    : infographics.filter(inf => inf.categories.includes(activeCategory));

  // Pagination
  const totalPages = Math.ceil(filteredInfographics.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInfographics = filteredInfographics.slice(startIndex, endIndex);

  // Get unique categories from all infographics
  const availableCategories = Array.from(
    new Set(infographics.flatMap(inf => inf.categories))
  ).sort();

  return (
    <section id="infographics" className="py-24 bg-lab-gray-200 relative border-t border-lab-white/5">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.02)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.02)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-lab-white mb-4">
            {t('title')} <span className="text-lab-yellow">{t('titleHighlight')}</span>
          </h2>
        </motion.div>

        {/* Filter Tabs */}
        {!loading && infographics.length > 0 && availableCategories.length > 0 && (
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                activeCategory === 'ALL'
                  ? 'bg-lab-yellow border-lab-yellow text-lab-black shadow-[0_0_15px_rgb(246_195_8/0.5)]'
                  : 'bg-transparent border-lab-gray-300 text-lab-gray-400 hover:border-lab-white hover:text-lab-white'
              }`}
            >
              {t('filterAll')}
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  activeCategory === category
                    ? 'bg-lab-yellow border-lab-yellow text-lab-black shadow-[0_0_15px_rgb(246_195_8/0.5)]'
                    : 'bg-transparent border-lab-gray-300 text-lab-gray-400 hover:border-lab-white hover:text-lab-white'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-lab-yellow/30 border-t-lab-yellow rounded-full animate-spin" />
          </div>
        ) : filteredInfographics.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-20 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="relative mb-6"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-24 h-24 rounded-xl bg-lab-gray-300/50 border-2 border-dashed border-lab-gray-400 flex items-center justify-center">
                <BarChart3 className="w-12 h-12 text-lab-gray-400" />
              </div>
              <motion.div
                className="absolute -right-3 -top-3 w-12 h-12 bg-lab-yellow rounded-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Search className="w-6 h-6 text-lab-black" />
              </motion.div>
            </motion.div>
            <h3 className="text-2xl font-bold text-lab-white mb-3">{t('emptyTitle')}</h3>
            <p className="text-lab-gray-400 text-center max-w-md">
              {t('emptySubtitle')}
              <br />
              <span className="text-lab-yellow">{t('emptyDetail')}</span>
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${activeCategory}-${currentPage}`}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {currentInfographics.map((infographic, index) => (
                <motion.div 
                  key={infographic.id}
                  className="group bg-lab-gray-100/50 backdrop-blur border border-lab-white/5 rounded-xl overflow-hidden hover:border-lab-yellow/50 hover:shadow-[0_0_30px_rgb(246_195_8/0.3)] transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  {/* Image */}
                  <div className="relative aspect-4/3 overflow-hidden bg-lab-gray-200">
                    <Image
                      src={infographic.imagePath}
                      alt={infographic.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-linear-to-t from-lab-black/80 via-lab-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        onClick={() => setLightboxImage(infographic)}
                        className="px-6 py-3 bg-lab-yellow text-lab-black rounded-full font-medium flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform duration-300"
                      >
                        <Eye size={18} />
                        {t('view')}
                      </button>
                    </div>
                    {/* Corner Accents */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-lab-yellow pointer-events-none" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-lab-yellow pointer-events-none" />
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-bold text-lab-white font-serif group-hover:text-lab-yellow transition-colors line-clamp-2">
                      {infographic.title}
                    </h3>
                    <p className="text-sm text-lab-gray-400 leading-relaxed line-clamp-3">
                      {infographic.description}
                    </p>
                    
                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {infographic.categories.map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="bg-lab-yellow/10 text-lab-yellow border-lab-yellow/30 text-xs"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!loading && filteredInfographics.length > ITEMS_PER_PAGE && (
          <motion.div 
            className="flex items-center justify-center gap-2 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-lab-gray-100 border border-lab-white/10 text-lab-white hover:bg-lab-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('previous')}
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === page
                      ? 'bg-lab-yellow text-lab-black shadow-[0_0_15px_rgb(246_195_8/0.5)]'
                      : 'bg-lab-gray-100 border border-lab-white/10 text-lab-white hover:bg-lab-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-lab-gray-100 border border-lab-white/10 text-lab-white hover:bg-lab-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('next')}
            </button>
          </motion.div>
        )}
      </div>

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
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-lab-yellow hover:bg-lab-yellow/80 flex items-center justify-center text-lab-black transition-all shadow-lg hover:scale-110 z-10"
              aria-label="Cerrar"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <X size={24} className="font-bold" />
            </motion.button>

            <div className="w-full max-w-6xl">
              <motion.div 
                className="relative w-full bg-lab-gray-50 rounded-2xl overflow-hidden shadow-2xl" 
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                {/* Imagen */}
                <div className="relative w-full bg-lab-gray-200">
                  <Image
                    src={lightboxImage.imagePath}
                    alt={lightboxImage.title}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain max-h-[65vh]"
                    sizes="100vw"
                    priority
                  />
                  {/* Decorative corners on image */}
                  <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-lab-yellow rounded-tl-lg" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-lab-yellow rounded-br-lg" />
                </div>
                
                {/* Info section */}
                <div className="p-6 md:p-8 bg-linear-to-br from-lab-gray-100 to-lab-gray-200 border-t-2 border-lab-yellow/20">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-lab-white leading-tight">
                      {lightboxImage.title}
                    </h3>
                  </div>
                  <p className="text-lab-gray-400 text-base md:text-lg mb-6 leading-relaxed">
                    {lightboxImage.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lightboxImage.categories.map((cat) => (
                      <Badge
                        key={cat}
                        className="bg-lab-yellow/90 text-lab-black border-0 px-3 py-1 text-sm font-semibold hover:bg-lab-yellow transition-colors"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
