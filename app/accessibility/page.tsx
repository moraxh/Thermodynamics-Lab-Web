import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SITE_INFO, CONTACT_INFO } from '@/lib/constants';

export const metadata = {
  title: `Declaración de Accesibilidad | ${SITE_INFO.name}`,
  description: `Compromiso de accesibilidad del Laboratorio ${SITE_INFO.name}`
};

export default function AccesibilidadPage() {
  return (
    <main className="min-h-screen bg-lab-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-lab-gray-400 hover:text-lab-yellow transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Volver al inicio
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8">
          Declaración de <span className="text-lab-yellow">Accesibilidad</span>
        </h1>

        <div className="space-y-8 text-lab-gray-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Nuestro Compromiso</h2>
            <p>
              {SITE_INFO.name} se compromete a garantizar la accesibilidad digital para personas con 
              discapacidades. Estamos continuamente mejorando la experiencia del usuario para todos y 
              aplicando los estándares de accesibilidad relevantes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Estándares de Conformidad</h2>
            <p>
              Nos esforzamos por cumplir con las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1 
              nivel AA. Estas pautas explican cómo hacer el contenido web más accesible para personas con 
              una amplia gama de discapacidades.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Medidas Implementadas</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Navegación por teclado completa</li>
              <li>Texto alternativo para imágenes</li>
              <li>Contraste de color adecuado</li>
              <li>Etiquetas ARIA para elementos interactivos</li>
              <li>Estructura semántica HTML5</li>
              <li>Tamaños de texto escalables</li>
              <li>Focus states visibles para navegación</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Tecnologías Compatibles</h2>
            <p>
              Nuestro sitio web está diseñado para ser compatible con las siguientes tecnologías de asistencia:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Lectores de pantalla (NVDA, JAWS, VoiceOver)</li>
              <li>Navegación por teclado</li>
              <li>Software de reconocimiento de voz</li>
              <li>Magnificadores de pantalla</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Limitaciones Conocidas</h2>
            <p>
              A pesar de nuestros mejores esfuerzos, algunas áreas del sitio pueden no ser completamente 
              accesibles. Estamos trabajando activamente para identificar y corregir estos problemas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Comentarios y Contacto</h2>
            <p>
              Valoramos sus comentarios sobre la accesibilidad de nuestro sitio. Si encuentra alguna 
              barrera de accesibilidad, por favor contáctenos:
            </p>
            <div className="mt-4 space-y-2">
              <p>
                Email:{' '}
                <a href={`mailto:${CONTACT_INFO.emails.general}`} className="text-lab-blue hover:text-lab-yellow transition-colors">
                  {CONTACT_INFO.emails.general}
                </a>
              </p>
              <p>Teléfono: {CONTACT_INFO.phones.main}</p>
            </div>
            <p className="mt-4">
              Nos esforzamos por responder a los comentarios en un plazo de 5 días hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Evaluación y Pruebas</h2>
            <p>
              Este sitio web ha sido evaluado utilizando herramientas automatizadas de accesibilidad y 
              pruebas manuales con tecnologías de asistencia para garantizar el cumplimiento de los 
              estándares de accesibilidad.
            </p>
          </section>

          <p className="text-sm pt-8 border-t border-white/10">
            Esta declaración fue creada en Diciembre de 2025 y se revisa periódicamente.
          </p>
        </div>
      </div>
    </main>
  );
}
