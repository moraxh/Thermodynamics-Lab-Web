import type { Metadata } from "next";
import { Lato, Montserrat } from 'next/font/google'
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import AuthProvider from "@/components/providers/AuthProvider";

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
    <html suppressHydrationWarning className="h-full overflow-x-hidden">
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
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${lato.variable} ${montserrat.variable} antialiased h-full overflow-x-hidden`}
      >
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
