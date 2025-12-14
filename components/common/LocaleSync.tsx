'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

export default function LocaleSync() {
  const locale = useLocale();

  useEffect(() => {
    // Sync locale to localStorage
    localStorage.setItem('locale', locale);
  }, [locale]);

  return null;
}
