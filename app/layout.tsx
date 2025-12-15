import type { Metadata } from "next";
import { Lato, Montserrat } from 'next/font/google'
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { Analytics } from "@vercel/analytics/next"

export const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
})

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: "LISTER | Laboratorio de Termodinámica y Sistemas Complejos",
  description: "Laboratorio de investigación en termodinámica de no equilibrio, inteligencia artificial aplicada, sistemas energéticos sostenibles y simulación computacional de alta fidelidad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  var root = document.documentElement;
                  
                  if (theme === 'system') {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                  } else {
                    root.classList.add(theme);
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }

                // Preservar posición de scroll en recargas
                if ('scrollRestoration' in history) {
                  history.scrollRestoration = 'manual';
                }
                
                // Restaurar scroll guardado
                window.addEventListener('load', function() {
                  var scrollPos = sessionStorage.getItem('scrollPos');
                  if (scrollPos) {
                    setTimeout(function() {
                      window.scrollTo(0, parseInt(scrollPos));
                      sessionStorage.removeItem('scrollPos');
                    }, 100);
                  }
                });
                
                // Guardar posición antes de recargar
                window.addEventListener('beforeunload', function() {
                  sessionStorage.setItem('scrollPos', window.scrollY.toString());
                });
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${lato.variable} ${montserrat.variable} antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
