'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';
import { motion } from 'motion/react';

export interface ResearchArea {
  id: string;
  title: string;
  description: string;
  iconName: string; // Mapping to Lucide icon name
  imageUrl: string;
}

const RESEARCH_AREAS: ResearchArea[] = [
  {
    id: '1',
    title: 'Termodinamica de Equilibrio y no Equilibrio',
    description: 'Análisis de sistemas en equilibrio térmico y procesos irreversibles, estudiando la generación de entropía y fluctuaciones en escalas micro y nanométricas.',
    iconName: 'Flame',
    imageUrl: 'equilibrium_thermodynamics.webp',
  },
  {
    id: '2',
    title: 'Reconocimiento de Patrones',
    description: 'Aplicación de algoritmos de machine learning y redes neuronales para identificar patrones térmicos complejos y predecir comportamientos energéticos.',
    iconName: 'BrainCircuit',
    imageUrl: 'pattern_recognition.webp',
  },
  {
    id: '3',
    title: 'Energías Renovables',
    description: 'Investigación en tecnologías de energía limpia, optimización de sistemas solares, eólicos y desarrollo de materiales para almacenamiento energético eficiente.',
    iconName: 'Lightbulb',
    imageUrl: 'renewable_energies.webp',
  },
  {
    id: '4',
    title: 'Transferencia de Calor',
    description: 'Estudio de mecanismos de conducción, convección y radiación térmica en sistemas complejos, con aplicaciones en refrigeración avanzada e intercambiadores.',
    iconName: 'Thermometer',
    imageUrl: 'heat_transfer.webp',
  },
];


const Research: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section id="research" className="py-16 md:py-24 bg-lab-black relative overflow-hidden">
      {/* Background decoration */}
      <motion.div 
        className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-lab-blue/10 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-lab-yellow/5 rounded-full blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-lab-white mb-4">
            Áreas de <span className="text-lab-yellow">Investigación</span>
          </h2>
          <p className="text-lab-gray-400 max-w-2xl mx-auto">
            Explorando los límites de la física y la computación para resolver los desafíos energéticos del mañana.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {RESEARCH_AREAS.map((area) => {
             // Dynamic Icon Rendering
             const IconComponent = (Icons as unknown as Record<string, React.FC<LucideProps>>)[area.iconName] || Icons.HelpCircle;

             return (
              <motion.div 
                key={area.id}
                variants={itemVariants}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="group relative h-96 rounded-xl overflow-hidden"
              >
                {/* Image Background with Parallax effect on hover */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(/assets/research/${area.imageUrl})` }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t dark:from-lab-black/95 dark:via-lab-black/70 dark:to-lab-black/20 dark:group-hover:from-lab-black/90 dark:group-hover:via-lab-black/60 transition-all duration-300" />

                {/* Glassmorphism Border */}
                <div className="absolute inset-0 border border-lab-white/10 rounded-xl group-hover:border-lab-yellow/50 transition-colors" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 group-hover:bg-lab-black/50 group-hover:backdrop-blur-md group-hover:rounded-lg group-hover:p-4 group-hover:-m-4">
                    <div className="w-12 h-12 rounded-lg bg-lab-black/30 backdrop-blur-md flex items-center justify-center text-lab-yellow mb-4 border border-lab-yellow/30 group-hover:bg-lab-yellow group-hover:text-lab-black transition-colors">
                      <IconComponent size={24} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mb-2 leading-tight group-hover:text-lab-yellow transition-colors">
                      {area.title}
                    </h3>
                    <p className="text-sm text-lab-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 transform translate-y-2 group-hover:translate-y-0">
                      {area.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Research;