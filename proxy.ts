import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n/request';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en', // Default to English if browser language not supported
  localePrefix: 'as-needed',
  localeDetection: true // Enable automatic locale detection from browser
});

export default function proxy(request: NextRequest) {
  // Skip middleware for API routes, static files, and admin routes
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.includes('/assets/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif)$/i)
  ) {
    return;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|admin|login|assets|.*\\..*).*)']
};
