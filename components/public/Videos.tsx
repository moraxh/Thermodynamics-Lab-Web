"use client"

import { useState, useEffect } from 'react';
import { Play, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Video {
  id: string;
  title: string;
  description: string;
  videoPath: string;
  thumbnailPath: string | null;
  uploadedAt: string;
}

export default function Videos() {
  const t = useTranslations('Videos');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const VIDEOS_PER_PAGE = 6;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        if (response.ok) {
          const data = await response.json();
          setVideos(data.data || []);
        }
      } catch (error) {
        // Error fetching videos
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
  const endIndex = startIndex + VIDEOS_PER_PAGE;
  const currentVideos = videos.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to section
      document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="videos" className="py-24 bg-lab-gray-100 relative border-t border-lab-white/5">
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
        ) : videos.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-20 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-2xl bg-lab-gray-200 border-2 border-dashed border-lab-gray-400 flex items-center justify-center">
                <Play className="w-12 h-12 text-lab-gray-400" />
              </div>
              <motion.div
                className="absolute -right-2 -top-2 w-12 h-12 bg-lab-yellow rounded-full flex items-center justify-center text-2xl"
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🎬
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
            {/* Videos Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {currentVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-lab-gray-200 rounded-xl overflow-hidden border border-lab-white/10 hover:border-lab-yellow/50 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-lab-gray-300 overflow-hidden">
                    {video.thumbnailPath ? (
                      <Image
                        src={video.thumbnailPath}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-16 h-16 text-lab-gray-400" />
                      </div>
                    )}
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-lab-yellow flex items-center justify-center shadow-lg">
                        <Play className="w-8 h-8 text-lab-black ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-lab-white mb-2 line-clamp-2 group-hover:text-lab-yellow transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-lab-gray-400 text-sm line-clamp-2 mb-4">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-lab-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(video.uploadedAt)}</span>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-lab-yellow/20 to-transparent rounded-bl-3xl" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                className="flex items-center justify-center gap-4"
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
                          ? 'bg-lab-yellow text-lab-black shadow-lg shadow-lab-yellow/25'
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

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl bg-lab-gray-100 rounded-2xl overflow-hidden border border-lab-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-lab-gray-200/90 hover:bg-lab-gray-300 text-lab-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Player */}
              <div className="relative w-full aspect-video bg-lab-black">
                <video
                  src={selectedVideo.videoPath}
                  controls
                  autoPlay
                  className="w-full h-full"
                  controlsList="nodownload"
                >
                  Tu navegador no soporta la reproducción de videos.
                </video>
              </div>

              {/* Video Info */}
              <div className="p-6 bg-lab-gray-100">
                <h3 className="text-2xl font-bold text-lab-white mb-2">
                  {selectedVideo.title}
                </h3>
                <p className="text-lab-gray-400 mb-4">
                  {selectedVideo.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-lab-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Subido el {formatDate(selectedVideo.uploadedAt)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
