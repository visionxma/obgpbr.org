import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ cep: string }> }) {
  const { cep } = await params;
  const digits = cep.replace(/\D/g, '');

  if (digits.length !== 8) {
    return NextResponse.json({ erro: true }, { status: 400 });
  }

  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
    next: { revalidate: 86400 }, // cache 24h
  });

  if (!res.ok) return NextResponse.json({ erro: true }, { status: 502 });

  const data = await res.json();
  return NextResponse.json(data);
}
