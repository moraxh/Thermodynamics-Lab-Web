"use client"

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Event {
  id: string;
  title: string;
  description: string;
  typeOfEvent: string;
  startDate: string;
  endDate: string | null;
  startTime: string;
  endTime: string;
  location: string;
  link: string | null;
  uploadedAt: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  conference: 'Conferencia',
  workshop: 'Taller',
  seminar: 'Seminario',
  lecture: 'Clase Magistral',
  symposium: 'Simposio',
  meeting: 'Reunión',
  other: 'Otro',
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const EVENTS_PER_PAGE = 6;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const totalPages = Math.ceil(events.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const endIndex = startIndex + EVENTS_PER_PAGE;
  const currentEvents = events.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isUpcoming = (startDate: string, endDate: string | null) => {
    const checkDate = endDate ? new Date(endDate) : new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate >= today;
  };

  return (
    <section id="events" className="py-24 bg-lab-gray-100 relative border-t border-lab-white/5">
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
            Próximos <span className="text-lab-yellow">Eventos</span>
          </h2>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-20 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mb-6">
              <CalendarIcon className="w-24 h-24 text-lab-gray-400" />
              <motion.div
                className="absolute -right-2 -top-2 w-12 h-12 bg-lab-yellow rounded-full flex items-center justify-center text-2xl"
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                📅
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-lab-white mb-3">¡Nada en el calendario!</h3>
            <p className="text-lab-gray-400 text-center max-w-xl">
              Los eventos están en una superposición cuántica... o simplemente en planificación.
              <br />
              <span className="text-lab-yellow">¡Vuelve pronto para descubrir qué hay! 🎪✨</span>
            </p>
          </motion.div>
        ) : (
          <>
            {/* Events Grid */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentPage}
                className="grid gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {currentEvents.map((event, index) => (
                  <motion.div 
                    key={event.id} 
                    className="group bg-lab-gray-200/50 backdrop-blur border border-lab-white/5 rounded-lg p-6 hover:bg-lab-gray-200 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgb(168_85_247/0.3)] transition-all duration-300"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="inline-block px-3 py-1 text-xs font-bold text-lab-black bg-purple-400 rounded shadow-[0_0_10px_rgb(192_132_252/0.4)]">
                            {EVENT_TYPE_LABELS[event.typeOfEvent] || event.typeOfEvent}
                          </span>
                          {isUpcoming(event.startDate, event.endDate) && (
                            <span className="inline-block px-3 py-1 text-xs font-bold text-green-400 bg-green-500/20 rounded border border-green-500/30">
                              Próximo
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-lab-white mb-2 font-serif group-hover:text-purple-400 transition-colors">
                          {event.title}
                        </h3>
                        
                        <p className="text-sm text-lab-white/90 leading-relaxed mb-4">
                          {event.description}
                        </p>

                        {/* Event Details */}
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-lab-gray-400">
                            <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {formatDate(event.startDate)}
                              {event.endDate && event.startDate !== event.endDate && (
                                <> - {formatDate(event.endDate)}</>
                              )}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-lab-gray-400">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-lab-gray-400 sm:col-span-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      {event.link && (
                        <div className="flex md:flex-col gap-3 md:items-end">
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 group/btn whitespace-nowrap"
                          >
                            <span>Más información</span>
                            <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </a>
                        </div>
                      )}
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
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
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
