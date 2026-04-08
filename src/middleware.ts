import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Uma função de middleware Edge-compatible profissional atuando como camada de segurança WAF básica.
export function middleware(request: NextRequest) {
  // === 1. Sanitize Data e XSS / SQL Injection Protection (Básico WAF em L7) ===
  const urlParams = request.nextUrl.searchParams.toString();
  
  // Detecção ingênua mas efetiva de payloads massivos SQL injection e XSS na URL
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi, // Previne ' -- # na URL
    /union\s+select/gi,
    /drop\s+table/gi,
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(urlParams)) {
      // Registrar no log que a requisição maliciosa foi dropada e retornar HTTP 403 Forbidden
      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'IP_Desconhecido';
      console.warn(`[SEC-WAF] Acesso bloqueado (Padrão Malicioso na URL detectado): IP associado:`, clientIp);
      return new NextResponse(
        JSON.stringify({ error: 'Conteúdo malicioso detectado e bloqueado pela política de Segurança do WAF interno' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // === 2. Limitação e Controle de Upload / Requisições ===
  // O middleware não lida totalmente com tamanho de corpo (body parser),
  // Mas podemos dropar métodos não confiáveis (impedir TRACE, OPTIONS etc. dependendo da rota).
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  if (!allowedMethods.includes(request.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // === 3. Segurança de Cabeçalhos e CSRF Base ===
  const response = NextResponse.next();
  // Aqui você pode inserir CSRF tokens se estivesse utilizando endpoints form tradicionais,
  // ou definir cookies seguros para JWT/Session

  // Evita cachear respostas HTTP para rotas /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
}

// Em quais caminhos o firewall/middleware deve agir?
export const config = {
  matcher: [
    /*
     * Engloba todas as rotas (request paths), exceto:
     * - API routes (/api/*) se você já tiver proteção local
     * - _next/static (Arquivos estáticos base NextJS)
     * - _next/image (Arquivos otimizados NextJS de imagens)
     * - Arquivos estáticos puros e icons base (favicon, sitemap etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
