"use client"

import { useState, useEffect } from 'react';
import { Download, Calendar, ChevronLeft, ChevronRight, FileText, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';

interface Material {
  id: string;
  title: string;
  description: string;
  filePath: string;
  uploadedAt: string;
}

export default function EducationalMaterial() {
  const t = useTranslations('EducationalMaterial');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const MATERIALS_PER_PAGE = 6;

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/api/educational-material');
        if (response.ok) {
          const data = await response.json();
          setMaterials(data.data || []);
        }
      } catch (error) {
        // Error fetching materials
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const totalPages = Math.ceil(materials.length / MATERIALS_PER_PAGE);
  const startIndex = (currentPage - 1) * MATERIALS_PER_PAGE;
  const endIndex = startIndex + MATERIALS_PER_PAGE;
  const currentMaterials = materials.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getFileExtension = (filePath: string) => {
    return filePath.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const getFileIcon = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'zip':
        return '🗜️';
      default:
        return '📁';
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      document.getElementById('educational-material')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownload = (material: Material) => {
    window.open(material.filePath, '_blank');
  };

  return (
    <section id="educational-material" className="py-24 bg-lab-black relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.02)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-lab-yellow/30 border-t-lab-yellow rounded-full animate-spin" />
          </div>
        ) : materials.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-20 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mb-6">
              <BookOpen className="w-24 h-24 text-lab-gray-400" />
              <motion.div
                className="absolute -right-2 -top-2 w-12 h-12 bg-lab-yellow rounded-full flex items-center justify-center text-2xl"
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                📚
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-lab-white mb-3">{t('emptyTitle')}</h3>
            <p className="text-lab-gray-400 text-center max-w-xl">
              {t('emptySubtitle')}
              <br />
              <span className="text-lab-yellow">{t('emptyDetail')}</span>
            </p>
          </motion.div>
        ) : (
          <>
            {/* Materials Grid */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentPage}
                className="grid gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {currentMaterials.map((material, index) => (
                  <motion.div 
                    key={material.id} 
                    className="group bg-lab-gray-100/50 backdrop-blur border border-lab-white/5 rounded-lg p-6 hover:bg-lab-gray-200 hover:border-green-500/50 hover:shadow-[0_0_30px_rgb(34_197_94/0.3)] transition-all duration-300"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        {/* File Icon */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                          {getFileIcon(material.filePath)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="inline-block px-3 py-1 text-xs font-bold text-lab-black bg-green-400 rounded shadow-[0_0_10px_rgb(34_197_94/0.4)]">
                              {getFileExtension(material.filePath)}
                            </span>
                            <span className="flex items-center text-xs text-lab-gray-400">
                              <Calendar size={12} className="mr-1" /> 
                              {formatDate(material.uploadedAt)}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-lab-white mb-2 font-serif group-hover:text-green-400 transition-colors">
                            {material.title}
                          </h3>
                          <p className="text-sm text-lab-white/90 leading-relaxed">
                            {material.description}
                          </p>
                        </div>
                      </div>

                      {/* Download Button */}
                      <div className="flex md:flex-col gap-3 md:items-end">
                        <button
                          onClick={() => handleDownload(material)}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 group/btn"
                        >
                          <Download className="w-5 h-5 group-hover/btn:animate-bounce" />
                          <span>{t('download')}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                className="flex items-center justify-center gap-4 mt-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-lab-gray-200 border border-lab-white/10 text-lab-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lab-gray-300 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                          : 'bg-lab-gray-200 border border-lab-white/10 text-lab-white hover:bg-lab-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-lab-gray-200 border border-lab-white/10 text-lab-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lab-gray-300 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
