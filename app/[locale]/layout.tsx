import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { locales } from '@/i18n/request';
import { ReactNode } from 'react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import LocaleSync from '@/components/common/LocaleSync';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages for the locale
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleSync />
      {children}
      <LanguageSwitcher />
    </NextIntlClientProvider>
  );
}
