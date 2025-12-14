'use client';

import { Linkedin, Mail, Twitter } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'motion/react';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  specialty: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 't1',
    name: 'Dra. Elena Vance',
    role: 'Directora de Investigación',
    specialty: 'Física Estadística',
    imageUrl: 'https://picsum.photos/id/338/400/400',
  },
  {
    id: 't2',
    name: 'Dr. Marcus Chen',
    role: 'Líder de IA',
    specialty: 'Redes Neuronales',
    imageUrl: 'https://picsum.photos/id/349/400/400',
  },
  {
    id: 't3',
    name: 'Ing. Sarah Connor',
    role: 'Ingeniería Térmica',
    specialty: 'Intercambiadores de Calor',
    imageUrl: 'https://picsum.photos/id/433/400/400',
  },
  {
    id: 't4',
    name: 'Dr. Alan Turing',
    role: 'Simulación',
    specialty: 'Dinámica de Fluidos',
    imageUrl: 'https://picsum.photos/id/551/400/400',
  },
];


export default function Team() {
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

  return (
    <section id="team" className="py-16 md:py-24 bg-lab-gray-100 relative border-t border-lab-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-lab-white mb-4">
            Nuestro <span className="text-lab-blue">Equipo</span>
          </h2>
          <p className="text-lab-gray-400 max-w-2xl mx-auto">
            Mentes brillantes unidas por la pasión de descubrir lo desconocido.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {TEAM_MEMBERS.map((member) => (
            <motion.div 
              key={member.id} 
              className="group relative"
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              style={{ perspective: "1000px" }}
            >
              {/* Holographic Container */}
              <div className="relative overflow-hidden rounded-lg bg-lab-gray-200 border border-lab-white/5 group-hover:border-lab-blue/50 transition-colors duration-300">
                
                {/* Image */}
                <div className="aspect-w-1 aspect-h-1 relative h-96 w-full">
                  <Image 
                    src={member.imageUrl} 
                    alt={member.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                  />
                  {/* Hologram Scanline Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgb(59_130_246/0.1)_50%)] bg-size-[100%_4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Glitch Overlay on Hover (using gradient) */}
                  <div className="absolute inset-0 bg-linear-to-tr from-lab-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info Card */}
                <div className="p-6 relative bg-lab-gray-200/95 backdrop-blur-sm border-t border-lab-white/5">
                  <h3 className="text-lg font-bold text-lab-white font-serif">{member.name}</h3>
                  <p className="text-lab-blue text-sm font-medium mb-1">{member.role}</p>
                  <p className="text-lab-gray-400 text-xs mb-4">{member.specialty}</p>
                  
                  {/* Social Links */}
                  <div className="flex space-x-4 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    <a href="#" className="text-lab-white hover:text-lab-yellow transition-colors"><Linkedin size={16} /></a>
                    <a href="#" className="text-lab-white hover:text-lab-yellow transition-colors"><Twitter size={16} /></a>
                    <a href="#" className="text-lab-white hover:text-lab-yellow transition-colors"><Mail size={16} /></a>
                  </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-lab-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-lab-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};