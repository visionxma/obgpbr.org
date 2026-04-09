import PublicLayout from '../components/PublicLayout';
import { Search, PenTool, Users, ArrowRight } from 'lucide-react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consultoria Estratégica Educacional',
  description: 'Consultoria pedagógica para prefeituras, OSCs e instituições. Diagnóstico, planejamento metodológico e acompanhamento técnico para projetos de impacto social.',
  openGraph: {
    title: 'Consultoria Educacional | OBGP',
    description: 'Soluções educacionais para prefeituras e instituições. Diagnóstico, planejamento e acompanhamento técnico de projetos sociais.',
    url: '/consultoria',
  },
};

export default function Consultoria() {
  const steps = [
    { num: "01", icon: Search, title: "Diagnóstico e Levantamentos", desc: "Assim como fizemos nas comunidades de Itapecuru, mapeamos e realizamos um rigoroso diagnóstico: forças locais, gargalos, mercado regional e metas factíveis.", color: "var(--site-primary)" },
    { num: "02", icon: PenTool, title: "Planejamento Metodológico", desc: "Desenhamos a esteira educacional e auxiliamos na elaboração de projetos e acessos a financiamento (PAA, PNAE, PRONAF) para prefeituras e OSCs.", color: "#23475E" },
    { num: "03", icon: Users, title: "Acompanhamento Técnico", desc: "Nossa equipe atua em campo garantindo que a metodologia rende frutos reais em projetos de empoderamento feminino e social.", color: "#26662F" }
  ];

  return (
    <PublicLayout>
      <main className="animate-fade-up" style={{ background: 'var(--site-bg)' }}>
        {/* HERO */}
        <section className="glass-section-white" style={{ 
          position: 'relative', overflow: 'hidden', padding: '100px 0 100px',
          textAlign: 'center'
        }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ maxWidth: 900, margin: '0 auto 20px' }}>
              Consultoria <span style={{ color: 'var(--site-primary)' }}>Estratégica Educacional</span>
            </h1>
            <p style={{ maxWidth: 700, margin: '0 auto 40px', fontSize: '1.25rem', color: 'var(--site-text-secondary)', lineHeight: 1.6 }}>
              Soluções educacionais customizadas para prefeituras, instituições privadas e projetos de alto impacto social.
            </p>
            <a 
              href="https://wa.me/5598981242316?text=Olá! Gostaria de agendar uma reunião especializada sobre Consultoria Estratégica."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary" 
              style={{ padding: '16px 40px', fontSize: '1.1rem', textDecoration: 'none' }}
            >
              Agendar Reunião Especializada
            </a>
          </div>
        </section>

        {/* METODOLOGIA */}
        <section className="glass-section-white" style={{ borderTop: 'none', padding: '80px 0' }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="glass-panel" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', flexDirection: i % 2 !== 0 ? 'row-reverse' : 'row', padding: 32, position: 'relative', overflow: 'hidden' }}>
                  
                  {/* Etiqueta de Número Fundo */}
                  <div style={{ position: 'absolute', top: -40, right: i % 2 === 0 ? 40 : 'auto', left: i % 2 !== 0 ? 40 : 'auto', fontSize: '12rem', fontWeight: 800, color: step.color, opacity: 0.03, fontFamily: 'var(--font-outfit)' }}>
                    {step.num}
                  </div>

                  <div style={{ flex: '1 1 400px', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 'var(--site-radius-md)', background: `${step.color}15`, color: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Icon size={32} strokeWidth={1.5} />
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>{step.title}</h2>
                    <p style={{ fontSize: '1.05rem', color: 'var(--site-text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                      {step.desc}
                    </p>
                    <a 
                      href={`https://wa.me/5598981242316?text=Olá! Gostaria de entender mais sobre a etapa de "${step.title}" da Consultoria Estratégica.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-glass" 
                      style={{ color: step.color, textDecoration: 'none' }}
                    >
                      Entender esta etapa <ArrowRight size={16} />
                    </a>
                  </div>
                  
                  <div style={{ flex: '1 1 400px', height: 340, borderRadius: 'var(--site-radius-lg)', border: '1px solid var(--site-border)', boxShadow: 'var(--site-shadow-sm)', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                    <img 
                      src={`/images/${i === 0 ? 'diagnostico' : i === 1 ? 'planejamento' : 'acompanhamento'}.png`} 
                      alt={step.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
