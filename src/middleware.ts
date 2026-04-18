import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export function middleware(request: NextRequest) {
  // === 1. WAF: XSS / SQL Injection Protection ===
  const urlParams = request.nextUrl.searchParams.toString();

  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(urlParams)) {
      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'IP_Desconhecido';
      console.warn(`[SEC-WAF] Acesso bloqueado (padrão malicioso na URL): IP`, clientIp);
      return new NextResponse(
        JSON.stringify({ error: 'Conteúdo malicioso detectado e bloqueado pela política de Segurança do WAF interno' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // === 2. Method check ===
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  if (!allowedMethods.includes(request.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // === 3. Supabase session refresh + headers ===
  const response = createClient(request);

  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
