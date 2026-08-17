import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Raíz de Pueblo | Terrenos en Colombia",
    template: "%s | Raíz de Pueblo",
  },
  description:
    "Descubre lotes, fincas y terrenos en pueblos de Colombia y contacta directamente a inmobiliarias locales.",
  applicationName: "Raíz de Pueblo",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Raíz de Pueblo",
    title: "Raíz de Pueblo | Terrenos en Colombia",
    description:
      "Descubre lotes, fincas y terrenos en pueblos de Colombia con contexto local.",
    images: [
      {
        url: "/og.png",
        width: 1733,
        height: 907,
        alt: "Raíz de Pueblo, terrenos con potencial en Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raíz de Pueblo | Terrenos en Colombia",
    description:
      "Descubre lotes, fincas y terrenos en pueblos de Colombia con contexto local.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <a
          href="#contenido"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-md bg-[var(--gold)] px-4 py-3 font-bold text-[var(--forest)] transition-transform focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
