'use client';

import { MapPin, Phone, Mail } from 'lucide-react';
import { CONTACT_INFO } from '@lib/constants';
import { motion } from 'motion/react';

export default function Contact() {
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
            <span className="text-lab-blue">Contacto</span>
          </h2>
          <p className="text-lab-gray-400 max-w-2xl mx-auto">
            Inicie una colaboración o solicite información sobre nuestros proyectos.
          </p>
        </motion.div>

        {/* Info & Visual Map */}
        <div className="max-w-4xl mx-auto">
          {/* Google Maps */}
          <motion.div 
            className="relative h-80 w-full rounded-xl overflow-hidden bg-lab-black border border-lab-white/10 mb-12 group"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.5!2d${CONTACT_INFO.address.coordinates.lon}!3d${CONTACT_INFO.address.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDMwJzI2LjMiTiAxMDHCsDExJzM2LjAiVw!5e0!3m2!1ses!2smx!4v1234567890`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
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
              className="flex flex-col items-center text-center gap-4 p-6 rounded-xl bg-lab-gray-200/50 border border-lab-white/5 hover:border-lab-blue/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-lab-blue/10 flex items-center justify-center text-lab-blue">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-lab-white font-bold mb-2">Laboratorio Central</h4>
                <p className="text-lab-gray-400 text-sm">
                  {CONTACT_INFO.address.line1}<br/>
                  {CONTACT_INFO.address.line2}<br/>
                  <span className="text-lab-blue text-xs mt-1 inline-block">{CONTACT_INFO.address.line3}</span>
                </p>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="flex flex-col items-center text-center gap-4 p-6 rounded-xl bg-lab-gray-200/50 border border-lab-white/5 hover:border-lab-blue/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-lab-blue/10 flex items-center justify-center text-lab-blue">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="text-lab-white font-bold mb-2">Email</h4>
                <p className="text-lab-gray-400 text-sm">{CONTACT_INFO.emails.general}<br/>{CONTACT_INFO.emails.research}</p>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="flex flex-col items-center text-center gap-4 p-6 rounded-xl bg-lab-gray-200/50 border border-lab-white/5 hover:border-lab-blue/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-lab-blue/10 flex items-center justify-center text-lab-blue">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="text-lab-white font-bold mb-2">Teléfono</h4>
                <p className="text-lab-gray-400 text-sm">{CONTACT_INFO.phones.main}<br/>{CONTACT_INFO.phones.secondary}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};