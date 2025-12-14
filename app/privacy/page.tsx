import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SITE_INFO, CONTACT_INFO } from '@lib/constants';

export const metadata = {
  title: `Política de Privacidad | ${SITE_INFO.name}`,
  description: `Política de privacidad del Laboratorio ${SITE_INFO.name}`
};

export default function PrivacidadPage() {
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
          Política de <span className="text-lab-yellow">Privacidad</span>
        </h1>

        <div className="space-y-8 text-lab-gray-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">1. Información que Recopilamos</h2>
            <p>
              En {SITE_INFO.name}, nos comprometemos a proteger su privacidad. Esta política describe cómo 
              recopilamos, usamos y protegemos su información personal cuando visita nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">2. Uso de la Información</h2>
            <p>
              La información que recopilamos se utiliza para mejorar nuestros servicios de investigación, 
              responder a consultas y mantenerlo informado sobre nuestros proyectos y publicaciones científicas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">3. Protección de Datos</h2>
            <p>
              Implementamos medidas de seguridad apropiadas para proteger su información personal contra 
              acceso no autorizado, alteración, divulgación o destrucción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">4. Cookies</h2>
            <p>
              Nuestro sitio web puede utilizar cookies para mejorar la experiencia del usuario. Puede 
              configurar su navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">5. Contacto</h2>
            <p>
              Si tiene preguntas sobre esta política de privacidad, puede contactarnos en{' '}
              <a href={`mailto:${CONTACT_INFO.emails.general}`} className="text-lab-blue hover:text-lab-yellow transition-colors">
                {CONTACT_INFO.emails.general}
              </a>
            </p>
          </section>

          <p className="text-sm pt-8 border-t border-white/10">
            Última actualización: Diciembre 2025
          </p>
        </div>
      </div>
    </main>
  );
}
