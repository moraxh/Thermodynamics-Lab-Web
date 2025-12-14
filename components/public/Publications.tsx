"use client"

import Button from '@components/common/Button';
import { Download, ExternalLink, Calendar, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';

type PublicationType = 'article' | 'book' | 'thesis' | 'technical_report' | 'monograph' | 'other';

interface Publication {
  id: string;
  title: string;
  description: string;
  type: PublicationType;
  authors: string[];
  publicationDate: string;
  filePath: string | null;
  thumbnailPath: string | null;
  link: string | null;
}

export default function Publications () {
  const t = useTranslations('Publications');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PublicationType | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  
  const TYPE_LABELS: Record<PublicationType, string> = {
    article: t('types.article'),
    book: t('types.book'),
    thesis: t('types.thesis'),
    technical_report: t('types.technical_report'),
    monograph: t('types.monograph'),
    other: t('types.other'),
  };
  
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch('/api/publications');
        if (response.ok) {
          const data = await response.json();
          setPublications(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching publications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Resetear página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const filteredPubs = activeTab === 'ALL' 
    ? publications 
    : publications.filter(pub => pub.type === activeTab);

  // Paginación
  const totalPages = Math.ceil(filteredPubs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPubs = filteredPubs.slice(startIndex, endIndex);

  // Obtener tipos únicos de publicaciones
  const availableTypes = Array.from(new Set(publications.map(p => p.type)));

  return (
    <section id="publications" className="py-24 bg-lab-black relative">
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
        {!loading && publications.length > 0 && (
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                activeTab === 'ALL'
                  ? 'bg-lab-blue border-lab-blue text-white shadow-[0_0_15px_rgb(59_130_246/0.5)]'
                  : 'bg-transparent border-lab-gray-300 text-lab-gray-400 hover:border-lab-white hover:text-lab-white'
              }`}
            >
              {t('filterAll')}
            </button>
            {availableTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  activeTab === type
                    ? 'bg-lab-blue border-lab-blue text-white shadow-[0_0_15px_rgb(59_130_246/0.5)]'
                    : 'bg-transparent border-lab-gray-300 text-lab-gray-400 hover:border-lab-white hover:text-lab-white'
                }`}
              >
                {TYPE_LABELS[type]}
              </button>
            ))}
          </motion.div>
        )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-lab-blue/30 border-t-lab-blue rounded-full animate-spin" />
        </div>
      ) : filteredPubs.length === 0 ? (
        <motion.div 
          className="flex flex-col items-center justify-center py-20 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-6">
            <FileText className="w-24 h-24 text-lab-gray-400" />
            <motion.div
              className="absolute -right-2 -top-2 w-8 h-8 bg-lab-yellow rounded-full flex items-center justify-center text-lab-black text-xl font-bold"
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              ?
            </motion.div>
          </div>
          <h3 className="text-2xl font-bold text-lab-white mb-3">{t('emptyTitle')}</h3>
          <p className="text-lab-gray-400 text-center max-w-md">
            {t('emptySubtitle')}
            <br />
            <span className="text-lab-blue">{t('emptyDetail')}</span>
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${activeTab}-${currentPage}`}
            className="grid gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {currentPubs.map((pub, index) => (
              <motion.div 
                key={pub.id} 
                className="group bg-lab-gray-100/50 backdrop-blur border border-lab-white/5 rounded-lg p-6 hover:bg-lab-gray-200 hover:border-lab-yellow/50 hover:shadow-[0_0_30px_rgb(246_195_8/0.3)] transition-all duration-300"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-block px-3 py-1 text-xs font-bold text-lab-black bg-lab-yellow rounded shadow-[0_0_10px_rgb(246_195_8/0.4)]">
                      {TYPE_LABELS[pub.type]}
                    </span>
                    <span className="flex items-center text-xs text-lab-gray-400">
                      <Calendar size={12} className="mr-1" /> 
                      {new Date(pub.publicationDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-lab-white mb-2 font-serif group-hover:text-lab-yellow transition-colors">
                    {pub.title}
                  </h3>
                  <p className="text-sm text-lab-gray-400 mb-2 italic">
                    {t('authors')} {pub.authors.join(', ')}
                  </p>
                  <p className="text-sm text-lab-gray-300 leading-relaxed">
                    {pub.description}
                  </p>
                </div>
                
                <div className="shrink-0 flex gap-2">
                  {pub.filePath && (
                    <a 
                      href={pub.filePath} 
                      download={`${pub.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button 
                        variant="outline" 
                        className="text-xs px-6 py-2 h-10 w-full md:w-auto" 
                        icon={<Download size={14}/>}
                      >
                        {t('download')}
                      </Button>
                    </a>
                  )}
                  {pub.link && (
                    <a 
                      href={pub.link} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button 
                        variant="outline" 
                        className="text-xs px-6 py-2 h-10 w-full md:w-auto" 
                        icon={<ExternalLink size={14}/>}
                      >
                        {t('viewLink')}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Paginación */}
      {!loading && filteredPubs.length > ITEMS_PER_PAGE && (
        <motion.div 
          className="flex items-center justify-center gap-2 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-lab-gray-200 text-lab-white flex items-center justify-center hover:bg-lab-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-lab-gray-200"
          >
            {t('previous')}
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Mostrar solo algunas páginas alrededor de la actual
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      currentPage === page
                        ? 'bg-lab-blue text-white shadow-[0_0_15px_rgb(59_130_246/0.5)]'
                        : 'bg-transparent border border-lab-gray-300 text-lab-gray-400 hover:border-lab-white hover:text-lab-white'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return (
                  <span key={page} className="flex items-center text-lab-gray-400 px-2">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-lab-gray-200 text-lab-white flex items-center justify-center hover:bg-lab-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-lab-gray-200"
          >
            {t('next')}
          </button>
        </motion.div>
      )}
      </div>
    </section>
  );
};