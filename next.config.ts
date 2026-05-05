import type { NextConfig } from "next";

// Define a Política de Segurança de Conteúdo (CSP) Nível Enterprise
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://kyhvqydnvaselautwcrm.supabase.co;
  child-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://kyhvqydnvaselautwcrm.supabase.co https://images.unsplash.com;
  media-src 'none';
  connect-src 'self' https://kyhvqydnvaselautwcrm.supabase.co;
  font-src 'self' https://fonts.gstatic.com;
  frame-ancestors 'none';
`;

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    // HSTS: Força HTTPS por 2 anos para proteger contra downgrade attacks e man-in-the-middle
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    // Mitiga ataques temporais de sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    // Anti click-jacking (Impede de renderizar o site num iframe)
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  serverExternalPackages: ['pdf-parse'],

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  async headers() {
    return [
      {
        // Aplica os cabeçalhos de segurança em todas as rotas da aplicação
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
