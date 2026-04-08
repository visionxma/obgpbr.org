import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import VisitorTracker from "@/components/VisitorTracker";
import "./globals.css";

const siteUrl = "https://genesiseducacional.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Instituto Gênesis Educacional | Cursos Técnicos, Pós-Técnico e Consultoria no Maranhão",
    template: "%s | Instituto Gênesis Educacional",
  },
  description:
    "Instituto Gênesis Educacional — cursos técnicos, pós-técnico, capacitação profissional e consultoria pedagógica para comunidades do Maranhão e Pará. Formação, inovação e desenvolvimento social desde 2013.",
  keywords: [
    "Instituto Gênesis",
    "Gênesis Educacional",
    "cursos técnicos Maranhão",
    "pós-técnico",
    "educação profissional",
    "cursos profissionalizantes",
    "consultoria pedagógica",
    "educação popular",
    "agricultura familiar",
    "agroecologia",
    "EAD Maranhão",
    "inclusão digital",
    "economia solidária",
    "desenvolvimento social",
    "comunidades quilombolas",
    "educação rural",
  ],
  authors: [{ name: "Instituto Gênesis Educacional" }],
  creator: "Instituto Gênesis Educacional",
  publisher: "Instituto Gênesis Educacional",
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
      siteName: "Instituto Gênesis Educacional",
      title: "Instituto Gênesis Educacional | Cursos Técnicos e Formação Profissional",
      description:
        "Cursos técnicos, pós-técnico, capacitação e consultoria pedagógica para comunidades do Maranhão e Pará. Educação que transforma desde 2013.",
      images: [
        {
          url: "/favicon.jpeg",
          width: 800,
          height: 800,
          alt: "Instituto Gênesis Educacional — Formação, Inovação e Desenvolvimento Social",
          type: "image/jpeg",
        },
      ],
    },
  twitter: {
    card: "summary_large_image",
    title: "Instituto Gênesis Educacional | Cursos Técnicos e Formação Profissional",
    description:
      "Cursos técnicos, pós-técnico, capacitação e consultoria pedagógica para comunidades do Maranhão e Pará.",
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
    "@type": "EducationalOrganization",
    name: "Instituto Gênesis Educacional",
    url: siteUrl,
    logo: `${siteUrl}/logo.PNG`,
    description:
      "Formação, inovação e desenvolvimento social para comunidades do Maranhão e Pará desde 2013.",
    foundingDate: "2013",
    areaServed: [
      { "@type": "State", name: "Maranhão" },
      { "@type": "State", name: "Pará" },
    ],
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
        <VisitorTracker />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
