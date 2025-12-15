'use client';

import { ChevronLeft, ChevronRight, UserX } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export interface TeamMember {
  id: string;
  fullName: string;
  position: string;
  photo: string | null;
  typeOfMember: string;
}

// Orden de los tipos de miembros
const MEMBER_TYPE_ORDER = [
  'Director',
  'Subdirector',
  'Investigador',
  'Estudiante de Doctorado',
  'Estudiante de Maestría',
  'Estudiante de Licenciatura',
  'Colaborador',
];

export default function Team() {
  const t = useTranslations('Team');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      // Ordenar miembros por tipo
      const sortedMembers = (data.data || []).sort((a: TeamMember, b: TeamMember) => {
        const aIndex = MEMBER_TYPE_ORDER.indexOf(a.typeOfMember);
        const bIndex = MEMBER_TYPE_ORDER.indexOf(b.typeOfMember);
        return aIndex - bIndex;
      });
      setMembers(sortedMembers);
    } catch (error) {
      // Error fetching members
    } finally {
      setLoading(false);
    }
  };

  const itemsPerPage = 4;
  const totalPages = members.length > 0 ? Math.ceil(members.length / itemsPerPage) : 1;
  
  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleMembers = members.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  // Mostrar mensaje si no hay miembros
  const showEmptyState = !loading && members.length === 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

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

  const getMemberTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Director': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      'Subdirector': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
      'Investigador': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      'Estudiante de Doctorado': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      'Estudiante de Maestría': 'bg-teal-500/20 text-teal-300 border-teal-500/50',
      'Estudiante de Licenciatura': 'bg-green-500/20 text-green-300 border-green-500/50',
      'Colaborador': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  };

  return (
    <section id="team" className="py-16 md:py-24 bg-lab-gray-100 relative border-t border-lab-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-lab-white mb-4">
            {t('title')} <span className="text-lab-blue">{t('titleHighlight')}</span>
          </h2>
          <p className="text-lab-gray-400 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : showEmptyState ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-20 px-4 min-h-[400px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mb-6">
              <UserX className="w-24 h-24 text-lab-gray-400" />
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
          <div className="relative">
            {/* Navigation Buttons */}
            {totalPages > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={isAnimating}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-lab-blue/20 hover:bg-lab-blue/40 text-lab-white p-3 rounded-full backdrop-blur-sm border border-lab-blue/50 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label={t('previous')}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={isAnimating}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-lab-blue/20 hover:bg-lab-blue/40 text-lab-white p-3 rounded-full backdrop-blur-sm border border-lab-blue/50 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label={t('next')}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Carousel Container */}
            <div className="overflow-hidden py-4">
              <AnimatePresence initial={false} custom={direction} mode="popLayout" onExitComplete={() => setIsAnimating(false)}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  className="flex justify-center px-4"
                >
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${
                    visibleMembers.length >= 4 ? 'lg:grid-cols-4' : 
                    visibleMembers.length === 3 ? 'lg:grid-cols-3' : 
                    visibleMembers.length === 2 ? 'lg:grid-cols-2' : 
                    'lg:grid-cols-1'
                  }`}
                  >
                  {visibleMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      className="group relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ 
                        scale: 1.05,
                        rotateY: 5,
                        transition: { duration: 0.3 }
                      }}
                      style={{ perspective: "1000px" }}
                    >
                      {/* Holographic Container */}
                      <div className="relative overflow-hidden rounded-lg bg-lab-gray-200 border border-lab-white/5 group-hover:border-lab-blue/50 transition-colors duration-300">
                        
                        {/* Type Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getMemberTypeColor(member.typeOfMember)}`}>
                            {member.typeOfMember}
                          </span>
                        </div>

                        {/* Image */}
                        <div className="aspect-w-1 aspect-h-1 relative h-80 w-full">
                          {member.photo ? (
                            <Image 
                              src={member.photo} 
                              alt={member.fullName}
                              width={400}
                              height={400}
                              className="w-full h-full object-cover transition-all duration-500"
                              priority={currentIndex === 0}
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-lab-gray-300/50 flex items-center justify-center">
                              <UserX className="w-20 h-20 text-lab-gray-400" />
                            </div>
                          )}
                          {/* Hologram Scanline Overlay */}
                          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgb(59_130_246/0.1)_50%)] bg-size-[100%_4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Glitch Overlay on Hover */}
                          <div className="absolute inset-0 bg-linear-to-tr from-lab-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Info Card */}
                        <div className="p-5 relative bg-lab-gray-200/95 backdrop-blur-sm border-t border-lab-white/5">
                          <h3 className="text-lg font-bold text-lab-white font-serif truncate">{member.fullName}</h3>
                          <p className="text-lab-blue text-sm font-medium truncate">{member.position}</p>
                        </div>

                        {/* Corner Accents - All 4 corners */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-lab-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-lab-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-lab-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-lab-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'w-8 bg-lab-blue' 
                        : 'w-2 bg-lab-gray-400 hover:bg-lab-blue/50'
                    }`}
                    aria-label={`Ir a página ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};