import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import VisitorTracker from "@/components/VisitorTracker";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const siteUrl = "https://obgpbr.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OBGP — Organização Brasil Gestão de Parcerias",
    template: "%s | OBGP",
  },
  description:
    "A OBGP é uma Organização da Sociedade Civil sem fins lucrativos que executa atividades, programas e projetos voltados à educação, saúde e assistência social.",
  keywords: [
    "OBGP",
    "Organização Brasil Gestão de Parcerias",
    "OSC",
    "organização da sociedade civil",
    "educação",
    "saúde",
    "assistência social",
    "projetos sociais",
    "desenvolvimento social",
    "gestão de parcerias",
    "terceiro setor",
    "sem fins lucrativos",
  ],
  authors: [{ name: "OBGP" }],
  creator: "OBGP",
  publisher: "OBGP",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "OBGP",
    title: "OBGP — Organização Brasil Gestão de Parcerias",
    description:
      "Organização da Sociedade Civil que atua em educação, saúde e assistência social com programas e projetos de impacto.",
    images: [
      {
        url: "/favicon.jpeg",
        width: 800,
        height: 800,
        alt: "OBGP — Organização Brasil Gestão de Parcerias",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OBGP — Organização Brasil Gestão de Parcerias",
    description:
      "Organização da Sociedade Civil que atua em educação, saúde e assistência social.",
    images: ["/favicon.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.jpeg", sizes: "32x32", type: "image/jpeg" },
      { url: "/favicon.jpeg", sizes: "192x192", type: "image/jpeg" },
    ],
    apple: [{ url: "/favicon.jpeg", sizes: "180x180", type: "image/jpeg" }],
  },
  manifest: "/manifest.json",
  verification: {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "Organização Brasil Gestão de Parcerias — OBGP",
    alternateName: "OBGP",
    url: siteUrl,
    logo: `${siteUrl}/logo.PNG`,
    description:
      "Organização da Sociedade Civil sem fins lucrativos que executa atividades, programas e projetos voltados à educação, saúde e assistência social.",
    sameAs: [],
  };

  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.jpeg" sizes="32x32" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/favicon.jpeg" />
        <meta name="theme-color" content="#0D364F" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ToastProvider />
        <VisitorTracker />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
