import { describe, it, expect } from 'vitest';

// ── Cert code format ─────────────────────────────────────────────────────────
// Pattern used in verificar/page.tsx for exact-match detection
const CERT_CODE_REGEX = /^RC\d+\d{8}OBGP$/i;

function buildCertCode(seq: number, date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getUTCFullYear());
  return `RC${seq}${dd}${mm}${yyyy}OBGP`;
}

describe('cert code format', () => {
  it('matches generated codes', () => {
    const code = buildCertCode(1, new Date('2025-04-18'));
    expect(code).toBe('RC118042025OBGP');
    expect(CERT_CODE_REGEX.test(code)).toBe(true);
  });

  it('matches higher sequence numbers', () => {
    const code = buildCertCode(42, new Date('2026-01-01'));
    expect(code).toBe('RC4201012026OBGP');
    expect(CERT_CODE_REGEX.test(code)).toBe(true);
  });

  it('is case-insensitive in regex', () => {
    expect(CERT_CODE_REGEX.test('rc118042025obgp')).toBe(true);
  });

  it('rejects partial codes', () => {
    expect(CERT_CODE_REGEX.test('RC18042025OBGP')).toBe(false); // missing seq
    expect(CERT_CODE_REGEX.test('RC1OBGP')).toBe(false);
    expect(CERT_CODE_REGEX.test('18042025OBGP')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(CERT_CODE_REGEX.test('')).toBe(false);
  });

  it('all generated codes are unique for different seq+date combos', () => {
    const codes = new Set([
      buildCertCode(1, new Date('2025-04-18')),
      buildCertCode(2, new Date('2025-04-18')),
      buildCertCode(1, new Date('2025-04-19')),
      buildCertCode(100, new Date('2025-04-18')),
    ]);
    expect(codes.size).toBe(4);
  });
});

// ── CNPJ detection ────────────────────────────────────────────────────────────
function detectInputType(raw: string): 'codigo' | 'cnpj' | 'razao_social' {
  const cnpjClean = raw.replace(/\D/g, '');
  if (CERT_CODE_REGEX.test(raw.trim())) return 'codigo';
  if (cnpjClean.length === 14) return 'cnpj';
  return 'razao_social';
}

describe('input type detection', () => {
  it('detects cert code', () => {
    expect(detectInputType('RC118042025OBGP')).toBe('codigo');
    expect(detectInputType('RC4201012026OBGP')).toBe('codigo');
  });

  it('detects CNPJ (formatted)', () => {
    expect(detectInputType('12.345.678/0001-99')).toBe('cnpj');
  });

  it('detects CNPJ (raw digits)', () => {
    expect(detectInputType('12345678000199')).toBe('cnpj');
  });

  it('detects razao social fallback', () => {
    expect(detectInputType('Associação Cultural')).toBe('razao_social');
    expect(detectInputType('12345')).toBe('razao_social'); // not 14 digits
  });

  it('does not detect partial CNPJ as cnpj', () => {
    expect(detectInputType('1234567')).toBe('razao_social');
  });
});

// ── CNPJ formatting ───────────────────────────────────────────────────────────
function fmtCnpj(cnpj: string | null): string {
  if (!cnpj) return '—';
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14) return cnpj;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

describe('CNPJ formatting', () => {
  it('formats 14-digit CNPJ', () => {
    expect(fmtCnpj('12345678000199')).toBe('12.345.678/0001-99');
  });

  it('returns already-formatted CNPJ unchanged (not 14 raw digits)', () => {
    expect(fmtCnpj('12.345.678/0001-99')).toBe('12.345.678/0001-99');
  });

  it('returns — for null', () => {
    expect(fmtCnpj(null)).toBe('—');
  });

  it('returns raw value if not 14 digits', () => {
    expect(fmtCnpj('123')).toBe('123');
  });
});

// ── Liberation gate ───────────────────────────────────────────────────────────
interface OscPerfil { certificacao_liberada: boolean }

function canAccessRelatorio(perfil: OscPerfil | null): boolean {
  return !!perfil?.certificacao_liberada;
}

describe('liberation gate', () => {
  it('blocks when perfil is null', () => {
    expect(canAccessRelatorio(null)).toBe(false);
  });

  it('blocks when certificacao_liberada is false', () => {
    expect(canAccessRelatorio({ certificacao_liberada: false })).toBe(false);
  });

  it('allows when certificacao_liberada is true', () => {
    expect(canAccessRelatorio({ certificacao_liberada: true })).toBe(true);
  });
});

// ── Two-step approval role check ──────────────────────────────────────────────
type ApprovalRole = 'admin_rt' | 'contador' | 'superadmin' | 'admin' | 'user' | null;

function canSign(role: ApprovalRole): boolean {
  return role === 'admin_rt' || role === 'contador' || role === 'superadmin';
}

function resolveSignRole(role: ApprovalRole): 'admin_rt' | 'contador' | null {
  if (role === 'admin_rt' || role === 'superadmin') return 'admin_rt';
  if (role === 'contador') return 'contador';
  return null;
}

describe('two-step approval role check', () => {
  it('admin_rt can sign', () => { expect(canSign('admin_rt')).toBe(true); });
  it('contador can sign', () => { expect(canSign('contador')).toBe(true); });
  it('superadmin can sign', () => { expect(canSign('superadmin')).toBe(true); });
  it('admin cannot sign', () => { expect(canSign('admin')).toBe(false); });
  it('user cannot sign', () => { expect(canSign('user')).toBe(false); });
  it('null cannot sign', () => { expect(canSign(null)).toBe(false); });

  it('superadmin signs as admin_rt', () => { expect(resolveSignRole('superadmin')).toBe('admin_rt'); });
  it('admin_rt signs as admin_rt', () => { expect(resolveSignRole('admin_rt')).toBe('admin_rt'); });
  it('contador signs as contador', () => { expect(resolveSignRole('contador')).toBe('contador'); });
  it('admin resolves to null', () => { expect(resolveSignRole('admin')).toBe(null); });
});

// ── Progress calculation ──────────────────────────────────────────────────────
interface RelatorioItem { status: string; is_header: boolean }

function calcProgress(itens: RelatorioItem[]): { conforme: number; total: number; pct: number } {
  const nonHeaders = itens.filter(i => !i.is_header);
  const conforme = nonHeaders.filter(i => i.status === 'conforme').length;
  const total = nonHeaders.length;
  return { conforme, total, pct: total > 0 ? Math.round((conforme / total) * 100) : 0 };
}

describe('relatorio progress calculation', () => {
  it('calculates 0% when all pending', () => {
    const itens: RelatorioItem[] = [
      { status: 'pendente', is_header: false },
      { status: 'pendente', is_header: false },
    ];
    expect(calcProgress(itens)).toEqual({ conforme: 0, total: 2, pct: 0 });
  });

  it('calculates 100% when all conforme', () => {
    const itens: RelatorioItem[] = [
      { status: 'conforme', is_header: false },
      { status: 'conforme', is_header: false },
    ];
    expect(calcProgress(itens)).toEqual({ conforme: 2, total: 2, pct: 100 });
  });

  it('excludes headers from count', () => {
    const itens: RelatorioItem[] = [
      { status: 'conforme', is_header: true },  // excluded
      { status: 'conforme', is_header: false },
      { status: 'pendente', is_header: false },
    ];
    expect(calcProgress(itens)).toEqual({ conforme: 1, total: 2, pct: 50 });
  });

  it('handles empty list', () => {
    expect(calcProgress([])).toEqual({ conforme: 0, total: 0, pct: 0 });
  });

  it('rounds percentage', () => {
    const itens: RelatorioItem[] = Array.from({ length: 3 }, (_, i) => ({
      status: i === 0 ? 'conforme' : 'pendente', is_header: false,
    }));
    expect(calcProgress(itens).pct).toBe(33); // 1/3 = 33.33... rounds to 33
  });
});
