import PublicLayout from '../components/PublicLayout';
import {
  Building2, ArrowRight, HeartHandshake, BookOpen, Stethoscope,
  ShieldCheck, Target, Heart, Users, CheckCircle2, GraduationCap,
  Mail, Phone, MapPin, Clock, ArrowUpRight, Send,
} from 'lucide-react';

export const metadata = { title: 'Início | OBGP — Organização Brasil Gestão de Parcerias' };

export default function InicioPage() {
  /* ── Dados: Atuação ── */
  const areas = [
    {
      icon: HeartHandshake, titulo: 'Assistência Social',
      subtitulo: 'Proteção e fortalecimento de vínculos',
      texto: 'Executa e gerencia ações socioassistenciais alinhadas ao SUAS, com foco em proteção social, fortalecimento de vínculos e garantia de direitos.',
      img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=500&fit=crop',
      bullets: ['Alinhamento ao SUAS', 'Proteção social básica e especial', 'Fortalecimento de vínculos comunitários'],
      color: 'var(--site-accent)', bgColor: 'var(--site-surface-green)',
    },
    {
      icon: GraduationCap, titulo: 'Educação',
      subtitulo: 'Capacitação e formação continuada',
      texto: 'Desenvolve e executa projetos educacionais com cursos, oficinas e formação continuada, para ampliar o acesso ao conhecimento e fortalecer competências.',
      img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop',
      bullets: ['Cursos presenciais e EAD', 'Capacitação profissional', 'Formação continuada'],
      color: 'var(--site-primary)', bgColor: 'var(--site-surface-blue)',
    },
    {
      icon: Stethoscope, titulo: 'Saúde',
      subtitulo: 'Promoção e cuidado integral',
      texto: 'Executa e gerencia ações de saúde em parceria com instituições públicas e privadas, com foco em promoção, prevenção e cuidado integral.',
      img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop',
      bullets: ['Articulação com o SUS', 'Promoção e prevenção', 'Parcerias público-privadas'],
      color: 'var(--site-gold-dark)', bgColor: 'var(--site-surface-gold)',
    },
  ];

  /* ── Dados: Contato ── */
  const channels = [
    { icon: Mail, title: 'E-mail', info: 'contato.org.obgp@gmail.com', sub: 'Respondemos em até 48h úteis', href: 'mailto:contato.org.obgp@gmail.com', color: 'icon-box-blue' },
    { icon: Phone, title: 'WhatsApp', info: '(98) 9 8710-0001', sub: 'Segunda a sexta, 8h–17h', href: 'https://wa.me/5598987100001', color: 'icon-box-green' },
    { icon: MapPin, title: 'Sede', info: 'Av. L, nº 10 D, Qd. 32', sub: 'Morada do Sol — Paço do Lumiar/MA', href: null, color: 'icon-box-gold' },
  ];

  return (
    <PublicLayout>

      {/* ╔══════════════════════════════════════════╗
          ║            HERO — INÍCIO                 ║
          ╚══════════════════════════════════════════╝ */}
      <section className="glass-section-blue page-hero" style={{ padding: '170px 0 110px' }}>
        <div className="container">
          <div className="hero-badge">
            <Building2 size={13} />
            ORGANIZAÇÃO DA SOCIEDADE CIVIL
          </div>
          <h1 style={{ maxWidth: 740, margin: '0 auto 24px' }}>
            Gestão de Parcerias com{' '}
            <span className="hero-accent-white">transparência</span>{' '}
            e{' '}
            <span className="hero-accent-white">impacto social</span>
          </h1>
          <p className="hero-subtitle">
            A OBGP é uma OSC sem fins lucrativos que executa atividades, programas e projetos voltados à educação, saúde e assistência social.
          </p>
          <div className="hero-divider" />
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36 }}>
            <a href="#quem-somos" className="btn btn-white">
              Saiba mais <ArrowRight size={17} />
            </a>
            <a href="#contato" className="btn btn-outline-light">
              Fale conosco
            </a>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════╗
          ║          QUEM SOMOS                      ║
          ╚══════════════════════════════════════════╝ */}
      <section id="quem-somos" className="section-padding">
        <div className="container">
          <div className="row-alternate">
            {/* Texto */}
            <div>
              <span className="section-label" style={{ display: 'block', marginBottom: 12 }}>Quem Somos</span>
              <h2 style={{ marginBottom: 24, lineHeight: 1.25 }}>
                Compromisso com o{' '}
                <span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>desenvolvimento</span>{' '}
                das comunidades
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--site-text-secondary)', marginBottom: 20 }}>
                A <strong style={{ color: 'var(--site-text-primary)' }}>Organização Brasil Gestão de Parcerias – OBGP</strong> é uma Organização da Sociedade Civil, pessoa jurídica de direito privado, associação privada e sem fins lucrativos.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--site-text-secondary)', marginBottom: 32 }}>
                Executa atividades, programas, projetos ou ações voltadas a serviços de{' '}
                <strong style={{ color: 'var(--site-text-primary)' }}>educação, saúde e assistência social</strong>, buscando fortalecer políticas públicas e promover impacto real.
              </p>
              <a href="/servicos" className="btn btn-primary">
                Conheça nossos serviços <ArrowRight size={17} />
              </a>
            </div>

            {/* Visual — Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: HeartHandshake, label: 'Assistência Social', color: '#26662F', bg: 'var(--site-surface-green)' },
                { icon: BookOpen, label: 'Educação', color: 'var(--site-primary)', bg: 'var(--site-surface-blue)' },
                { icon: Stethoscope, label: 'Saúde', color: 'var(--site-gold-dark)', bg: 'var(--site-surface-gold)' },
                { icon: ShieldCheck, label: 'Transparência', color: 'var(--site-primary)', bg: 'var(--site-surface-blue)' },
              ].map(({ icon: Icon, label, color, bg }, i) => (
                <div key={label} className={`stagger-${i + 1}`}
                  style={{
                    padding: '28px 20px', borderRadius: 'var(--site-radius-lg)',
                    background: bg, display: 'flex', flexDirection: 'column',
                    gap: 14, transition: 'transform .3s ease',
                  }}>
                  <Icon size={28} style={{ color }} />
                  <span style={{ fontWeight: 600, fontSize: '.95rem', color: 'var(--site-text-primary)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ NÚMEROS ═══ */}
      <section className="glass-section-blue" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="grid-4" style={{ textAlign: 'center' }}>
            {[
              { num: '3', label: 'Áreas de atuação' },
              { num: '8', label: 'Serviços especializados' },
              { num: '100%', label: 'Transparência pública' },
              { num: 'OSC', label: 'Selo de conformidade' },
            ].map((s, i) => (
              <div key={i} className={`stagger-${i + 1}`} style={{ padding: '20px 8px' }}>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem,5vw,3.5rem)',
                  fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.03em',
                }}>{s.num}</div>
                <div style={{ fontSize: '.88rem', color: 'rgba(255,255,255,0.55)', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PILARES ═══ */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Nossos Pilares</span>
            <h2>Guiados por{' '}<span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>valores</span>{' '}que transformam</h2>
            <p>Os princípios que orientam cada decisão e parceria da OBGP.</p>
            <div className="section-line" />
          </div>
          <div className="grid-3">
            {[
              { icon: Target, title: 'Missão', color: 'icon-box-blue', text: 'Executar programas e projetos voltados à educação, saúde e assistência social, fortalecendo políticas públicas e promovendo desenvolvimento comunitário.' },
              { icon: Heart, title: 'Valores', color: 'icon-box-green', text: 'Transparência, compromisso social, eficiência na gestão de recursos públicos e respeito aos princípios da legalidade e participação cidadã.' },
              { icon: Users, title: 'Visão', color: 'icon-box-gold', text: 'Ser referência em gestão de parcerias entre organizações da sociedade civil e o poder público, promovendo inclusão e impacto social mensurável.' },
            ].map(({ icon: Icon, title, text, color }, i) => (
              <div key={title} className={`glass-panel stagger-${i + 1}`}
                style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className={`icon-box ${color}`}><Icon size={24} /></div>
                <div>
                  <h3 style={{ marginBottom: 10 }}>{title}</h3>
                  <p style={{ color: 'var(--site-text-secondary)', fontSize: '.95rem', lineHeight: 1.75 }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════╗
          ║             ATUAÇÃO                      ║
          ╚══════════════════════════════════════════╝ */}
      <section id="atuacao" className="glass-section-white section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Áreas de Atuação</span>
            <h2>Onde a OBGP{' '}<span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>atua</span></h2>
            <p>Três eixos estratégicos para fortalecer políticas públicas e promover impacto social.</p>
            <div className="section-line" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
            {areas.map(({ icon: Icon, titulo, subtitulo, texto, img, bullets, color, bgColor }, i) => (
              <div key={titulo} className={`row-alternate ${i % 2 !== 0 ? 'reverse' : ''}`}>
                {/* Imagem */}
                <div style={{ borderRadius: 'var(--site-radius-xl)', overflow: 'hidden', position: 'relative', minHeight: 300 }}>
                  <img src={img} alt={titulo} className="img-cover" style={{ height: '100%', position: 'absolute', inset: 0 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, transparent 60%)' }} />
                  <div style={{
                    position: 'absolute', top: 20, left: 20,
                    padding: '9px 16px', borderRadius: 'var(--site-radius-full)',
                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
                    color: 'white', fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em',
                    textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 7,
                  }}>
                    <Icon size={14} /> {titulo}
                  </div>
                </div>
                {/* Texto */}
                <div>
                  <div style={{
                    width: 46, height: 46, borderRadius: 'var(--site-radius-md)',
                    background: bgColor, color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', marginBottom: 18,
                  }}><Icon size={20} /></div>
                  <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color, marginBottom: 8 }}>{subtitulo}</p>
                  <h3 style={{ fontSize: 'clamp(1.5rem,2.5vw,1.9rem)', marginBottom: 14, lineHeight: 1.2 }}>{titulo}</h3>
                  <p style={{ color: 'var(--site-text-secondary)', lineHeight: 1.8, fontSize: '.98rem', marginBottom: 22 }}>{texto}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {bullets.map(b => (
                      <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircle2 size={15} style={{ color, flexShrink: 0 }} />
                        <span style={{ fontSize: '.9rem', color: 'var(--site-text-secondary)' }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════╗
          ║             CONTATO                      ║
          ╚══════════════════════════════════════════╝ */}
      <section id="contato" className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Fale Conosco</span>
            <h2>Vamos{' '}<span className="font-cursive" style={{ color: 'var(--site-gold-dark)' }}>conversar?</span></h2>
            <p>Propostas de parceria, dúvidas ou qualquer assunto — estamos prontos para atender.</p>
            <div className="section-line" />
          </div>

          <div className="grid-3">
            {channels.map(({ icon: Icon, title, info, sub, href, color }, i) => {
              const Tag = href ? 'a' : 'div';
              const extra = href ? {
                href,
                target: href.startsWith('http') ? '_blank' as const : undefined,
                rel: href.startsWith('http') ? 'noopener noreferrer' : undefined,
              } : {};
              return (
                <Tag key={title} {...extra}
                  className={`glass-panel stagger-${i + 1}`}
                  style={{
                    padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 24,
                    textDecoration: 'none', color: 'inherit', cursor: href ? 'pointer' : 'default',
                    position: 'relative', overflow: 'hidden',
                  }}>
                  {href && <ArrowUpRight size={17} style={{ position: 'absolute', top: 20, right: 20, color: 'var(--site-text-tertiary)', opacity: 0.35 }} />}
                  <div className={`icon-box ${color}`}><Icon size={22} /></div>
                  <div>
                    <h3 style={{ marginBottom: 8, fontSize: '1.1rem' }}>{title}</h3>
                    <p style={{ color: 'var(--site-text-primary)', fontWeight: 600, fontSize: '.95rem', wordBreak: 'break-word', marginBottom: 6 }}>{info}</p>
                    <p style={{ color: 'var(--site-text-tertiary)', fontSize: '.85rem' }}>{sub}</p>
                  </div>
                </Tag>
              );
            })}
          </div>

          {/* Horário */}
          <div className="stagger-4" style={{
            marginTop: 44, padding: '28px 32px', borderRadius: 'var(--site-radius-lg)',
            background: 'var(--site-surface-warm)', border: '1px solid var(--site-border)',
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          }}>
            <div className="icon-box icon-box-gold"><Clock size={22} /></div>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Horário de Atendimento</h3>
              <p style={{ color: 'var(--site-text-secondary)', fontSize: '.95rem' }}>
                Segunda a sexta-feira, das <strong>8h às 17h</strong> (horário de Brasília)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="glass-section-blue" style={{ padding: '88px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', maxWidth: 560, margin: '0 auto 16px' }}>
            Pronto para{' '}<span className="hero-accent-white">fortalecer</span>{' '}sua organização?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.65)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7, fontSize: '1.05rem' }}>
            Conheça os serviços que oferecemos para qualificar a gestão de parcerias da sua OSC.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/servicos" className="btn btn-white">Ver serviços <ArrowRight size={17} /></a>
            <a href="/selo-osc" className="btn btn-outline-light">Selo OSC</a>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
