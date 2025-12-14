import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SITE_INFO } from '@/lib/constants';
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
      ? `Términos de Uso | ${SITE_INFO.name}`
      : `Terms of Use | ${SITE_INFO.name}`,
    description: isEs
      ? `Términos y condiciones de uso del Laboratorio ${SITE_INFO.name}`
      : `Terms and conditions of ${SITE_INFO.name} Laboratory`
  };
}

export default async function TerminosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return <TerminosContent />;
}

function TerminosContent() {
  const t = useTranslations('Terms');
  
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
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('section1')}</h2>
            <p>
              {t('section1Text')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('section2')}</h2>
            <p>
              {SITE_INFO.name} {t('section2Text')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('section3')}</h2>
            <p>
              {SITE_INFO.name} {t('section3Text')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('section4')}</h2>
            <p>
              {t('section4Text')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('section5')}</h2>
            <p>
              {SITE_INFO.name} {t('section5Text')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t('section6')}</h2>
            <p>
              {t('section6Text')}
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
