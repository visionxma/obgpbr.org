'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Leaf, Users, HeartHandshake, Laptop, LineChart, ChevronLeft, ChevronRight } from 'lucide-react';

const pilares = [
  {
    icon: BookOpen,
    title: 'Cursos Técnicos & Pós-Técnico',
    desc: 'Formações técnicas e pós-técnicas com polos estruturados no interior do Maranhão, Pará e todo o Brasil, levando educação profissional de qualidade para onde ela é mais necessária.',
    color: '#0D364F',
    image: '/carousel/cursostec.jpg',
  },
  {
    icon: Leaf,
    title: 'Agricultura Regenerativa',
    desc: 'Assistência técnica e acompanhamento direto para quintais produtivos e propriedades agroecológicas, promovendo soberania alimentar e sustentabilidade ambiental.',
    color: '#26662F',
    image: '/carousel/agricultura.jpg',
  },
  {
    icon: Users,
    title: 'Educação Popular',
    desc: 'Cursos técnicos desenvolvidos com foco na realidade das comunidades rurais, quilombolas e ribeirinhas, respeitando seus saberes e fortalecendo sua autonomia.',
    color: '#AF9C6D',
    image: '/images/acompanhamento.png',
  },
  {
    icon: HeartHandshake,
    title: 'Economia Solidária',
    desc: 'Gestão de cooperativas, redes de escoamento da produção familiar e articulação de mercados justos que valorizam o trabalho coletivo e a produção sustentável.',
    color: '#23475E',
    image: '/images/blog_mulheres.png',
  },
  {
    icon: Laptop,
    title: 'Inclusão Digital Jovem',
    desc: 'Capacitação em informática básica, produção digital e autonomia tecnológica para jovens rurais, abrindo portas para o mercado de trabalho e o empreendedorismo.',
    color: '#0D364F',
    image: '/carousel/inclusao.jpg',
  },
  {
    icon: LineChart,
    title: 'Consultoria Estratégica',
    desc: 'Planejamento metodológico, elaboração de projetos e captação de recursos para prefeituras, OSCs e movimentos sociais que buscam impacto real e sustentável.',
    color: '#C5AB76',
    image: '/carousel/consultoria.jpg',
  },
];

export default function PilaresCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  }, [animating]);

  const prev = () => goTo((current - 1 + pilares.length) % pilares.length);
  const next = useCallback(() => goTo((current + 1) % pilares.length), [current, goTo]);

  // Auto-advance every 6s
  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  const pilar = pilares[current];
  const Icon = pilar.icon;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '80vh',
      minHeight: 520,
      overflow: 'hidden',
      borderRadius: 'var(--site-radius-lg)',
    }}>
      {/* Background Image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${pilar.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'opacity 0.5s ease',
        opacity: animating ? 0 : 1,
      }} />

      {/* Dark overlay for readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 100%)',
      }} />

      {/* Color accent strip at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 4,
        background: pilar.color,
        transition: 'background 0.4s ease',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 8%',
        maxWidth: 900,
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(12px)' : 'translateY(0)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 'var(--site-radius-lg)',
          background: pilar.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
          boxShadow: `0 8px 24px ${pilar.color}60`,
        }}>
          <Icon size={34} color="white" strokeWidth={1.8} />
        </div>

        {/* Slide counter */}
        <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: 12, textTransform: 'uppercase' }}>
          {String(current + 1).padStart(2, '0')} / {String(pilares.length).padStart(2, '0')}
        </div>

        <h2 style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {pilar.title}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', lineHeight: 1.7, maxWidth: 600 }}>
          {pilar.desc}
        </p>
      </div>

      {/* Navigation Arrows — ocultos no mobile, visíveis no desktop */}
      <button onClick={prev} className="carousel-arrow carousel-arrow-left"
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        <ChevronLeft size={22} />
      </button>

      <button onClick={next} className="carousel-arrow carousel-arrow-right"
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot Indicators */}
      <div style={{
        position: 'absolute', bottom: 28, right: 32,
        zIndex: 3, display: 'flex', gap: 8, alignItems: 'center',
      }}>
        {pilares.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === current ? 28 : 8,
            height: 8, borderRadius: 'var(--site-radius-full)',
            background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      <style>{`
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          zIndex: 3;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 0;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .carousel-arrow-left { left: 24px; }
        .carousel-arrow-right { right: 24px; }

        @media (max-width: 640px) {
          .carousel-arrow { display: none; }
        }
      `}</style>
    </div>
  );
}
