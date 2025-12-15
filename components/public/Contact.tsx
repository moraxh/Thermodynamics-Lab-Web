'use client';

import { MapPin, Phone, Mail } from 'lucide-react';
import { CONTACT_INFO } from '@lib/constants';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

// Carga dinámica del mapa para evitar problemas de SSR
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-lab-gray-200">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-lab-blue/30 border-t-lab-blue rounded-full animate-spin" />
        <p className="text-lab-gray-400 text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
});

export default function Contact() {
  const t = useTranslations('Contact');
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="contact" className="py-24 bg-lab-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-lab-white mb-4">
            <span className="text-lab-blue">{t('title')}</span>
          </h2>
          <p className="text-lab-gray-400 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Info & Visual Map */}
        <div className="max-w-4xl mx-auto">
          {/* Interactive Map */}
          <motion.div 
            className="relative h-80 w-full rounded-xl overflow-hidden bg-lab-black border border-lab-white/10 mb-12 group"
            style={{ minHeight: '320px' }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MapComponent />
          </motion.div>

          {/* Contact Info Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="flex flex-col p-6 rounded-xl bg-lab-gray-200/50 border border-lab-white/5 hover:border-lab-blue/30 transition-colors"
            >
              <div className="flex flex-col items-center text-center gap-3 flex-1">
                <div className="w-14 h-14 rounded-full bg-lab-blue/10 flex items-center justify-center text-lab-blue flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div className="flex-1 flex flex-col">
                  <h4 className="text-lab-white font-bold mb-2">{t('addressTitle')}</h4>
                  <p className="text-lab-gray-400 text-sm">
                    {CONTACT_INFO.address.line1}<br/>
                    {CONTACT_INFO.address.line2}<br/>
                    <span className="text-lab-blue text-xs mt-1 inline-block">{CONTACT_INFO.address.line3}</span>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="flex flex-col p-6 rounded-xl bg-lab-gray-200/50 border border-lab-white/5 hover:border-lab-blue/30 transition-colors"
            >
              <div className="flex flex-col items-center text-center gap-3 flex-1">
                <div className="w-14 h-14 rounded-full bg-lab-blue/10 flex items-center justify-center text-lab-blue flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div className="flex-1 flex flex-col">
                  <h4 className="text-lab-white font-bold mb-2">{t('emailTitle')}</h4>
                  <p className="text-lab-gray-400 text-sm break-all">{CONTACT_INFO.emails.general}<br/>{CONTACT_INFO.emails.research}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="flex flex-col p-6 rounded-xl bg-lab-gray-200/50 border border-lab-white/5 hover:border-lab-blue/30 transition-colors"
            >
              <div className="flex flex-col items-center text-center gap-3 flex-1">
                <div className="w-14 h-14 rounded-full bg-lab-blue/10 flex items-center justify-center text-lab-blue flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div className="flex-1 flex flex-col">
                  <h4 className="text-lab-white font-bold mb-2">{t('phoneTitle')}</h4>
                  <p className="text-lab-gray-400 text-sm">{CONTACT_INFO.phones.main}<br/>{CONTACT_INFO.phones.secondary}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};