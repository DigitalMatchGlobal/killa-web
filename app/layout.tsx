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

/**
 * En Vercel las URLs de Open Graph deben apuntar al deployment que realmente
 * sirve la imagen. Al pasar a killa.com.ar, NEXT_PUBLIC_SITE_URL permite fijar
 * el dominio definitivo sin volver a tocar el código.
 */
const deploymentUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;
const metadataOrigin = deploymentUrl
  ? deploymentUrl.startsWith("http")
    ? deploymentUrl
    : `https://${deploymentUrl}`
  : site.url;

export const metadata: Metadata = {
  metadataBase: new URL(metadataOrigin),
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
    url: "/",
    siteName: site.legalName,
    title,
    description,
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Killa Comunicaciones — Conectamos el norte que transforma" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F4F8FC",
  colorScheme: "light dark",
};

const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem('killa-color-theme');
      var theme = saved === 'light' || saved === 'dark'
        ? saved
        : 'light';
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (_) {
      document.documentElement.dataset.theme = 'light';
      document.documentElement.style.colorScheme = 'light';
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-AR"
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable} ${mono.variable}`}
    >
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
