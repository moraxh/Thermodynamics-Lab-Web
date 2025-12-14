import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  distDir: '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos'
      },
      {
        protocol: 'https',
        hostname: 'ugaxjotnixozmgazlzdu.supabase.co',
        pathname: '/storage/v1/object/public/**'
      }
    ],
    // Si quieres permitir cualquier dominio (menos seguro):
    // unoptimized: true
  }
};

export default withNextIntl(nextConfig);
