import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SITE_INFO } from '@lib/constants';

export const metadata = {
  title: `Términos de Uso | ${SITE_INFO.name}`,
  description: `Términos y condiciones de uso del Laboratorio ${SITE_INFO.name}`
};

export default function TerminosPage() {
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
          Términos de <span className="text-lab-yellow">Uso</span>
        </h1>

        <div className="space-y-8 text-lab-gray-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">1. Aceptación de Términos</h2>
            <p>
              Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos de uso y 
              todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, 
              no utilice este sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">2. Uso del Sitio</h2>
            <p>
              Este sitio web es proporcionado por {SITE_INFO.name} con fines informativos y educativos. 
              El contenido está destinado a la divulgación científica y colaboración académica.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">3. Propiedad Intelectual</h2>
            <p>
              Todo el contenido de este sitio, incluyendo texto, gráficos, logos, imágenes y software, 
              es propiedad de {SITE_INFO.name} o sus colaboradores y está protegido por las leyes 
              de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">4. Publicaciones Científicas</h2>
            <p>
              Las publicaciones científicas presentadas en este sitio están sujetas a sus propios derechos 
              de autor y licencias. El uso de material científico debe respetar las normas académicas de citación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">5. Limitación de Responsabilidad</h2>
            <p>
              {SITE_INFO.name} no será responsable por ningún daño directo, indirecto, incidental o 
              consecuente que resulte del uso o la imposibilidad de usar este sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">6. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios 
              entrarán en vigor inmediatamente después de su publicación en el sitio.
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
