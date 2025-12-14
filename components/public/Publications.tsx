"use client"

import Button from '@components/common/Button';
import { Download, Calendar } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export enum PublicationCategory {
  THERMODYNAMICS = 'Termodinámica',
  AI = 'Inteligencia Artificial',
  ENERGY = 'Energía',
  SIMULATION = 'Simulación'
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  date: string;
  category: PublicationCategory;
  abstract: string;
}

export const PUBLICATIONS: Publication[] = [
  {
    id: 'p1',
    title: 'Entropy Production in Quantum Systems',
    authors: 'E. Vance, A. Turing',
    date: '2023-11-15',
    category: PublicationCategory.THERMODYNAMICS,
    abstract: 'Un análisis profundo sobre la producción de entropía en sistemas cuánticos abiertos bajo condiciones extremas.',
  },
  {
    id: 'p2',
    title: 'Neural Networks for Heat Exchanger Optimization',
    authors: 'M. Chen, S. Connor',
    date: '2024-01-20',
    category: PublicationCategory.AI,
    abstract: 'Uso de aprendizaje por refuerzo para optimizar la geometría de microcanales de refrigeración.',
  },
  {
    id: 'p3',
    title: 'Next-Gen Solar Thermal Storage',
    authors: 'S. Connor, E. Vance',
    date: '2024-03-10',
    category: PublicationCategory.ENERGY,
    abstract: 'Nuevos materiales de cambio de fase para almacenamiento térmico de alta densidad.',
  },
  {
    id: 'p4',
    title: 'CFD Simulation of Plasma Containment',
    authors: 'A. Turing',
    date: '2024-02-05',
    category: PublicationCategory.SIMULATION,
    abstract: 'Modelado de turbulencias magnéticas en reactores de fusión experimental.',
  },
  {
    id: 'p5',
    title: 'Predictive Maintenance using Thermal Vision',
    authors: 'M. Chen',
    date: '2023-12-01',
    category: PublicationCategory.AI,
    abstract: 'Detección temprana de fallos en infraestructura crítica mediante termografía asistida por IA.',
  },
];

export default function Publications () {
  const [activeTab, setActiveTab] = useState<PublicationCategory | 'ALL'>('ALL');

  const filteredPubs = activeTab === 'ALL' 
    ? PUBLICATIONS 
    : PUBLICATIONS.filter(pub => pub.category === activeTab);

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
            Publicaciones <span className="text-lab-yellow">Científicas</span>
          </h2>
        </motion.div>

        {/* Filter Tabs */}
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
            Todas
          </button>
          {Object.values(PublicationCategory).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                activeTab === cat
                  ? 'bg-lab-blue border-lab-blue text-white shadow-[0_0_15px_rgb(59_130_246/0.5)]'
                  : 'bg-transparent border-lab-gray-300 text-lab-gray-400 hover:border-lab-white hover:text-lab-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

      {/* List */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          className="grid gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {filteredPubs.map((pub, index) => (
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
                    {pub.category}
                  </span>
                  <span className="flex items-center text-xs text-lab-gray-400">
                    <Calendar size={12} className="mr-1" /> {pub.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-lab-white mb-2 font-serif group-hover:text-lab-yellow transition-colors">
                  {pub.title}
                </h3>
                <p className="text-sm text-lab-gray-400 mb-2 italic">
                  Autores: {pub.authors}
                </p>
                <p className="text-sm text-lab-gray-300 leading-relaxed">
                  {pub.abstract}
                </p>
              </div>
              
              <div className="shrink-0">
                <Button variant="outline" className="text-xs px-6 py-2 h-10 w-full md:w-auto" icon={<Download size={14}/>}>
                  PDF
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Mockup */}
      <div className="flex justify-center mt-12 gap-2">
          <button className="w-10 h-10 rounded-lg bg-lab-gray-200 text-lab-white flex items-center justify-center hover:bg-lab-blue transition-colors">1</button>
          <button className="w-10 h-10 rounded-lg bg-transparent border border-lab-gray-300 text-lab-gray-400 flex items-center justify-center hover:border-lab-white hover:text-lab-white transition-colors">2</button>
          <button className="w-10 h-10 rounded-lg bg-transparent border border-lab-gray-300 text-lab-gray-400 flex items-center justify-center hover:border-lab-white hover:text-lab-white transition-colors">3</button>
        </div>
      </div>
    </section>
  );
};