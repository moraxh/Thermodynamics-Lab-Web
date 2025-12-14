import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SITE_INFO, CONTACT_INFO } from '@/lib/constants';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const isEs = locale === 'es';
  
  return {
    title: isEs 
      ? `Declaración de Accesibilidad | ${SITE_INFO.name}`
      : `Accessibility Statement | ${SITE_INFO.name}`,
    description: isEs
      ? `Compromiso de accesibilidad del Laboratorio ${SITE_INFO.name}`
      : `Accessibility commitment of ${SITE_INFO.name} Laboratory`
  };
}

export default async function AccesibilidadPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return <AccesibilidadContent />;
}

function AccesibilidadContent() {
  const t = useTranslations('Accessibility');
  
  return (
    <main className="min-h-screen bg-lab-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-lab-gray-400 hover:text-lab-yellow transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          {t('backHome')}
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8">
          {t('title')} <span className="text-lab-yellow">{t('titleHighlight')}</span>
        </h1>

        <div className="space-y-8 text-lab-gray-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('commitment')}</h2>
            <p>
              {SITE_INFO.name} {t('commitmentText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('standards')}</h2>
            <p>
              {t('standardsText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('measures')}</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t('measure1')}</li>
              <li>{t('measure2')}</li>
              <li>{t('measure3')}</li>
              <li>{t('measure4')}</li>
              <li>{t('measure5')}</li>
              <li>{t('measure6')}</li>
              <li>{t('measure7')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('technologies')}</h2>
            <p>
              {t('technologiesText')}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>{t('tech1')}</li>
              <li>{t('tech2')}</li>
              <li>{t('tech3')}</li>
              <li>{t('tech4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('limitations')}</h2>
            <p>
              {t('limitationsText')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('feedback')}</h2>
            <p>
              {t('feedbackText')}
            </p>
            <div className="mt-4 space-y-2">
              <p>
                {t('email')}{' '}
                <a href={`mailto:${CONTACT_INFO.emails.general}`} className="text-lab-blue hover:text-lab-yellow transition-colors">
                  {CONTACT_INFO.emails.general}
                </a>
              </p>
              <p>{t('phone')} {CONTACT_INFO.phones.main}</p>
            </div>
            <p className="mt-4">
              {t('responseTime')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('evaluation')}</h2>
            <p>
              {t('evaluationText')}
            </p>
          </section>

          <p className="text-sm pt-8 border-t border-white/10">
            {t('lastUpdate')}
          </p>
        </div>
      </div>
    </main>
  );
}
