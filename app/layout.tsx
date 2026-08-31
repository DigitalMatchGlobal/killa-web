import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";

import { site } from "@/lib/site";
import "./globals.css";

/**
 * Sora para títulos (geométrica, aperturas cerradas, aguanta tamaños grandes),
 * Inter para lectura y JetBrains Mono para las etiquetas técnicas: los nombres
 * de localidad del mapa, los eyebrows y los datos de red.
 */
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-brand",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const title = "Killa Comunicaciones — Internet, tecnología y medios en el norte";
const description =
  "Trece años conectando el norte argentino. Internet para hogares, soluciones de telecomunicaciones, producción audiovisual y Killa TV.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: "%s · Killa" },
  description,
  applicationName: site.legalName,
  keywords: [
    "internet Cafayate",
    "internet Cachi",
    "internet Valles Calchaquíes",
    "proveedor de internet Salta",
    "internet Yuto Jujuy",
    "Killa Internet",
    "Killa TV",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: site.url,
    siteName: site.legalName,
    title,
    description,
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Killa Comunicaciones — Conectamos el norte que transforma" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F8FC" },
    { media: "(prefers-color-scheme: dark)", color: "#040A16" },
  ],
  colorScheme: "dark light",
};

const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem('killa-color-theme');
      var theme = saved === 'light' || saved === 'dark'
        ? saved
        : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (_) {
      document.documentElement.dataset.theme = 'dark';
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${sora.variable} ${inter.variable} ${mono.variable}`}>
      <head>
        {/* Se ejecuta antes del primer render para evitar un destello del tema incorrecto. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/*
          Sin JavaScript no corre el IntersectionObserver que revela las
          secciones, así que el contenido quedaría invisible. Esto lo devuelve
          a su estado final.
        */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: ".reveal{opacity:1 !important;transform:none !important}",
            }}
          />
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
