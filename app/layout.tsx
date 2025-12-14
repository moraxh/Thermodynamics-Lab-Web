import type { Metadata } from "next";
import { Lato, Montserrat } from 'next/font/google'
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";

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
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${lato.variable} ${montserrat.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
