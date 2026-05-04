import Image from "next/image";
import PublicLayout from "../components/PublicLayout";
import AnimatedCounter from "../components/AnimatedCounter";
import {
  Building2,
  ArrowRight,
  HeartHandshake,
  BookOpen,
  Stethoscope,
  ShieldCheck,
  Target,
  Heart,
  Users,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUpRight,
  Award,
  FileText,
  Briefcase,
  Scale,
  HandCoins,
  FileCheck,
  UserCheck,
  TrendingUp,
  Lock,
  Star,
  BadgeCheck,
  Landmark,
  Zap,
} from "lucide-react";

export const metadata = {
  title: "Início | OBGP — Organização Brasil Gestão de Parcerias",
};

const AREAS = [
  {
    icon: HeartHandshake,
    titulo: "Assistência Social",
    subtitulo: "Proteção e fortalecimento de vínculos",
    texto:
      "Executa e gerencia ações socioassistenciais alinhadas ao SUAS, com foco em proteção social, fortalecimento de vínculos e garantia de direitos, atendendo indivíduos e famílias em situação de vulnerabilidade e risco.",
    img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=500&fit=crop",
    bullets: [
      "Alinhamento integral ao SUAS",
      "Proteção social básica e especial",
      "Fortalecimento de vínculos comunitários",
      "Atendimento a famílias vulneráveis",
    ],
    color: "var(--site-accent)",
    bgColor: "var(--site-surface-green)",
  },
  {
    icon: GraduationCap,
    titulo: "Educação",
    subtitulo: "Capacitação e formação continuada",
    texto:
      "Desenvolve e executa projetos educacionais com cursos, oficinas, capacitação e formação continuada, em formato presencial ou remoto, para ampliar o acesso ao conhecimento e fortalecer competências para o trabalho.",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop",
    bullets: [
      "Cursos presenciais e EAD",
      "Capacitação profissional",
      "Formação continuada certificada",
      "Oficinas e workshops especializados",
    ],
    color: "var(--site-primary)",
    bgColor: "var(--site-surface-blue)",
  },
  {
    icon: Stethoscope,
    titulo: "Saúde",
    subtitulo: "Promoção e cuidado integral",
    texto:
      "Executa e gerencia ações e serviços de saúde, em parceria com instituições públicas e privadas, com foco em promoção, prevenção e cuidado integral, articulando-se ao SUS quando aplicável.",
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop",
    bullets: [
      "Articulação com o SUS",
      "Promoção e prevenção em saúde",
      "Parcerias público-privadas",
      "Cuidado integral à comunidade",
    ],
    color: "var(--site-gold-dark)",
    bgColor: "var(--site-surface-gold)",
  },
];

const SERVICOS = [
  {
    icon: HandCoins,
    title: "Captação de Recursos",
    desc: "Financiamentos junto a órgãos públicos, agências de fomento e organizações internacionais.",
    color: "icon-box-blue",
  },
  {
    icon: FileCheck,
    title: "Diagnóstico de Viabilidade",
    desc: "Avaliação jurídica, fiscal, trabalhista, social e técnica dos projetos a serem propostos.",
    color: "icon-box-green",
  },
  {
    icon: FileText,
    title: "Elaboração Técnica de Projetos",
    desc: "Propostas completas, planos de trabalho, orçamentos e cronogramas físico-financeiros.",
    color: "icon-box-gold",
  },
  {
    icon: Briefcase,
    title: "Gestão de Contratos",
    desc: "Coordenação de convênios, termos de colaboração e demais instrumentos congêneres.",
    color: "icon-box-blue",
  },
  {
    icon: Scale,
    title: "Representação Institucional",
    desc: "Representação junto à Administração Pública Municipal, Estadual e Federal e conselhos.",
    color: "icon-box-green",
  },
  {
    icon: UserCheck,
    title: "Prestação de Contas",
    desc: "Relatórios técnicos e financeiros periódicos com legalidade, transparência e eficiência.",
    color: "icon-box-gold",
  },
];

const DIFERENCIAIS = [
  {
    icon: BadgeCheck,
    title: "Certificação Real",
    text: "O Selo OSC atesta conformidade jurídica, fiscal e técnica com base na Lei nº 13.019/2014.",
  },
  {
    icon: TrendingUp,
    title: "Ciclo Completo",
    text: "Da captação à prestação de contas: cobertura total de todas as etapas da parceria entre a administração pública e as organizações da sociedade civil.",
  },
  {
    icon: Lock,
    title: "Segurança Jurídica",
    text: "Fundamentado no MROSC, Decreto nº 8.726/2016 e demais legislações vigentes.",
  },
  {
    icon: Landmark,
    title: "Foco em Execução",
    text: "Não apenas consultoria: executamos, gerenciamos e acompanhamos cada projeto e parceria.",
  },
];

const CHANNELS = [
  {
    icon: Mail,
    title: "E-mail",
    info: "contato.org.obgp@gmail.com",
    sub: "Respondemos em até 48h úteis",
    href: "mailto:contato.org.obgp@gmail.com",
    color: "icon-box-blue",
  },
  {
    icon: Phone,
    title: "WhatsApp",
    info: "(98) 9 8710-0001",
    sub: "Segunda a sexta, 8h–17h",
    href: "https://wa.me/5598987100001",
    color: "icon-box-green",
  },
  {
    icon: MapPin,
    title: "Sede",
    info: "Av. L, nº 10 D, Qd. 32",
    sub: "Morada do Sol — Paço do Lumiar/MA",
    href: null,
    color: "icon-box-gold",
  },
];

const TICKER_ITEMS = [
  "Lei nº 13.019/2014",
  "MROSC",
  "SUAS",
  "SUS",
  "Termo de Colaboração",
  "Chamamento Público",
  "Prestação de Contas",
  "Transparência Pública",
  "Gestão de Parcerias",
  "OSC Certificada",
  "Decreto nº 8.726/2016",
  "Selo OSC",
];
const TICKER_DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS];

const HERO_BULLETS = [
  {
    icon: Zap,
    text: "Ciclo completo da parceria entre a administração pública e as organizações da sociedade civil — captação à prestação de contas",
  },
  {
    icon: BadgeCheck,
    text: "Projeto Selo OSC: certificação de conformidade institucional",
  },
  { icon: ShieldCheck, text: "Fundamentado no MROSC · Lei nº 13.019/2014" },
];

export default function InicioPage() {
  return (
    <PublicLayout>
      {/* ══════════════════════════════════════════════════════
          HERO  —  full-screen, coluna única, logo no fundo
      ══════════════════════════════════════════════════════ */}
      <section
        className="glass-section-blue hero-fs hero-inicio"
        style={{ paddingTop: 72 }}
      >
        {/* ── Conteúdo principal — cresce e centraliza verticalmente ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="container">
            <div
              style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}
            >
              {/* H1 — mensagem principal, impacto máximo */}
              <h1
                className="stagger-2 h1-display"
                style={{
                  color: "white",
                  maxWidth: 760,
                  margin: "0 auto 16px",
                  fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                  lineHeight: 1.08,
                }}
              >
                Gestão de Parcerias com{" "}
                <span className="hero-accent-white">eficiência</span> e{" "}
                <span className="hero-accent-white">conformidade</span>
              </h1>

              {/* Sub — contexto da proposta */}
              <p
                className="stagger-3"
                style={{
                  maxWidth: 520,
                  margin: "0 auto 20px",
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "var(--text-lg)",
                  lineHeight: 1.65,
                }}
              >
                Suporte técnico completo para OSCs que firmam parcerias com a
                administração pública — da captação de recursos à prestação de
                contas.
              </p>

              {/* Bullets — diferenciais escaneáveis */}
              <div
                className="stagger-4"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxWidth: 480,
                  margin: "0 auto 22px",
                  textAlign: "left",
                }}
              >
                {HERO_BULLETS.map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        flexShrink: 0,
                        background: "rgba(197,171,118,0.14)",
                        border: "1px solid rgba(197,171,118,0.22)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={12} style={{ color: "var(--site-gold)" }} />
                    </div>
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "rgba(255,255,255,0.72)",
                        lineHeight: 1.45,
                      }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div
                className="stagger-5"
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <a
                  href="/servicos"
                  className="btn btn-white"
                  style={{ fontSize: "var(--text-sm)", padding: "12px 24px" }}
                >
                  Nossos Serviços <ArrowRight size={15} />
                </a>
                <a
                  href="/selo-osc"
                  className="btn btn-gold"
                  style={{ fontSize: "var(--text-sm)", padding: "12px 24px" }}
                >
                  <Award size={15} /> Selo OSC
                </a>
                <a
                  href="#contato"
                  className="btn btn-outline-light"
                  style={{ fontSize: "var(--text-sm)", padding: "12px 24px" }}
                >
                  Fale Conosco
                </a>
              </div>

              {/* Nota legal discreta */}
              <p
                style={{
                  marginTop: 12,
                  fontSize: "var(--text-2xs)",
                  color: "rgba(255,255,255,0.25)",
                  letterSpacing: "var(--tracking-wider)",
                  textTransform: "uppercase",
                }}
              >
                OSC · Lei nº 13.019/2014 · MROSC
              </p>
            </div>
          </div>
        </div>

        {/* ── Trust bar — ancora no fundo da seção ── */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="container">
            <div
              style={{
                display: "flex",
                gap: 0,
                paddingTop: 18,
                paddingBottom: 22,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  num: "3",
                  label: "Áreas de Atuação",
                  sub: "Educação · Saúde · Assistência Social",
                },
                {
                  num: "8",
                  label: "Serviços Especializados",
                  sub: "Ciclo completo de parcerias",
                },
                {
                  num: "100%",
                  label: "Transparência Pública",
                  sub: "Portal de transparência ativo",
                },
                {
                  num: "OSC",
                  label: "Projeto Selo OSC",
                  sub: "Certificação institucional própria",
                },
              ].map(({ num, label, sub }, i, arr) => (
                <div
                  key={label}
                  style={{
                    flex: "1 1 120px",
                    textAlign: "center",
                    padding: "16px 12px",
                    borderRight:
                      i < arr.length - 1
                        ? "1px solid rgba(255,255,255,0.07)"
                        : "none",
                  }}
                >
                  <div
                    className="stat-num-xl"
                    style={{ color: "white", marginBottom: 5 }}
                  >
                    {num}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.85)",
                      marginTop: 5,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "rgba(255,255,255,0.38)",
                      marginTop: 3,
                    }}
                  >
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker-wrap" aria-hidden>
        <div className="ticker">
          {TICKER_DOUBLED.map((item, i) => (
            <span key={i} className="ticker-item">
              <Star
                size={9}
                style={{ color: "var(--site-gold)", flexShrink: 0 }}
              />
              <span
                className="ticker-item-value"
                style={{ fontSize: "var(--text-sm)" }}
              >
                {item}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          QUEM SOMOS
      ══════════════════════════════════════════════ */}
      <section id="quem-somos" className="section-padding">
        <div className="container">
          <div className="row-alternate">
            {/* Texto */}
            <div>
              <span className="section-label">Quem Somos</span>
              <h2 style={{ marginBottom: 18, lineHeight: 1.2 }}>
                Referência em{" "}
                <span
                  className="font-cursive"
                  style={{ color: "var(--site-gold-dark)" }}
                >
                  gestão
                </span>{" "}
                de parcerias entre a administração pública e as organizações da
                sociedade civil
              </h2>

              <p
                style={{
                  lineHeight: 1.8,
                  color: "var(--site-text-secondary)",
                  marginBottom: 12,
                }}
              >
                A{" "}
                <strong style={{ color: "var(--site-text-primary)" }}>
                  OBGP — Organização Brasil Gestão de Parcerias
                </strong>{" "}
                é uma Organização da Sociedade Civil (OSC), pessoa jurídica de
                direito privado, associação privada e sem fins lucrativos.
              </p>
              <p
                style={{
                  lineHeight: 1.8,
                  color: "var(--site-text-secondary)",
                  marginBottom: 20,
                }}
              >
                A OBGP executa atividades, programas, projetos ou ações voltadas
                ou vinculadas a serviços de educação, saúde e assistência
                social.
              </p>

              {/* Bullets escaneáveis */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                {[
                  {
                    icon: ShieldCheck,
                    text: "Conformidade com o MROSC (Lei nº 13.019/2014)",
                  },
                  {
                    icon: Award,
                    text: "Certificação própria — Projeto Selo OSC",
                  },
                  {
                    icon: HeartHandshake,
                    text: "Atuação em Educação, Saúde e Assistência Social",
                  },
                  {
                    icon: TrendingUp,
                    text: "Suporte do planejamento à prestação de contas",
                  },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--site-radius-sm)",
                        background: "var(--site-surface-blue)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--site-primary)",
                      }}
                    >
                      <Icon size={17} />
                    </div>
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--site-text-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <a href="/servicos" className="btn btn-primary">
                Nossos Serviços <ArrowRight size={16} />
              </a>
            </div>

            {/* Cards 2×2 */}
            <div
              className="mobile-sticky-stack"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {[
                {
                  icon: HeartHandshake,
                  label: "Assistência Social",
                  sub: "Alinhado ao SUAS",
                  color: "#26662F",
                  bg: "var(--site-surface-green)",
                },
                {
                  icon: BookOpen,
                  label: "Educação",
                  sub: "Cursos e capacitação",
                  color: "var(--site-primary)",
                  bg: "var(--site-surface-blue)",
                },
                {
                  icon: Stethoscope,
                  label: "Saúde",
                  sub: "Articulado ao SUS",
                  color: "var(--site-gold-dark)",
                  bg: "var(--site-surface-gold)",
                },
                {
                  icon: ShieldCheck,
                  label: "Transparência",
                  sub: "100% pública",
                  color: "var(--site-primary)",
                  bg: "var(--site-surface-blue)",
                },
              ].map(({ icon: Icon, label, sub, color, bg }, i) => (
                <div
                  key={label}
                  className={`stagger-${i + 1} sticky-item`}
                  style={{
                    padding: "32px 18px",
                    borderRadius: "var(--site-radius-xl)",
                    background: bg,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    border: "1px solid var(--site-border)",
                    zIndex: i + 1,
                  }}
                >
                  <Icon size={26} style={{ color }} />
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: ".9rem",
                        color: "var(--site-text-primary)",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: ".78rem",
                        color: "var(--site-text-tertiary)",
                        marginTop: 2,
                      }}
                    >
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS ANIMADOS
      ══════════════════════════════════════════════ */}
      <section className="glass-section-blue" style={{ padding: "52px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <span
              className="section-label"
              style={{ color: "var(--site-gold)", marginBottom: 8 }}
            >
              OBGP em números
            </span>
            <h2 style={{ color: "white" }}>
              Estrutura pensada para{" "}
              <span className="hero-accent-white">resultados</span>
            </h2>
          </div>
          <div className="lp-stats-grid">
            {[
              {
                num: 3,
                suffix: "",
                label: "Áreas de Atuação",
                sub: "Educação, Saúde e Assistência Social",
                special: false,
              },
              {
                num: 8,
                suffix: "",
                label: "Serviços Especializados",
                sub: "Ciclo completo de parcerias entre a administração pública e as organizações da sociedade civil",
                special: false,
              },
              {
                num: 100,
                suffix: "%",
                label: "Transparência Pública",
                sub: "Portal de transparência ativo e público",
                special: false,
              },
              {
                num: 1,
                suffix: "",
                label: "Projeto Selo OSC",
                sub: "Certificação institucional própria",
                special: true,
              },
            ].map(({ num, suffix, label, sub, special }, i) => (
              <div
                key={label}
                className={`lp-stats-cell stagger-${i + 1}`}
                style={{
                  borderBottom:
                    i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                <div className="lp-stats-num">
                  {special ? (
                    <>
                      Selo
                      <span
                        style={{
                          display: "block",
                          color: "var(--site-gold)",
                          fontSize: "0.45em",
                          fontWeight: 700,
                          letterSpacing: ".08em",
                          marginTop: 2,
                        }}
                      >
                        OSC
                      </span>
                    </>
                  ) : (
                    <AnimatedCounter target={num} suffix={suffix} />
                  )}
                </div>
                <div className="lp-stats-label">{label}</div>
                <div className="lp-stats-sub">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PILARES
      ══════════════════════════════════════════════ */}
      <section className="section-padding section-watermark">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Nossos Pilares</span>
            <h2>
              Guiados por{" "}
              <span
                className="font-cursive"
                style={{ color: "var(--site-gold-dark)" }}
              >
                valores
              </span>{" "}
              que transformam
            </h2>
            <p>
              Os princípios que orientam cada decisão, projeto e parceria da
              OBGP.
            </p>
            <div className="section-line" />
          </div>
          <div className="mobile-sticky-stack">
            {[
              {
                icon: Target,
                title: "Missão",
                color: "icon-box-blue",
                text: "Executar programas voltados à educação, saúde e assistência social, fortalecendo políticas públicas e promovendo desenvolvimento comunitário.",
              },
              {
                icon: Heart,
                title: "Valores",
                color: "icon-box-green",
                text: "Transparência, compromisso social e eficiência na gestão de recursos públicos, com respeito à legalidade e participação cidadã.",
              },
              {
                icon: Users,
                title: "Visão",
                color: "icon-box-gold",
                text: "Ser referência nacional em gestão de parcerias entre OSCs e o poder público, promovendo inclusão e governança exemplar.",
              },
            ].map(({ icon: Icon, title, text, color }, i) => (
              <div
                key={title}
                className={`glass-panel stagger-${i + 1} sticky-item`}
                  style={{
                    padding: "40px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    zIndex: i + 1,
                    background: "white",
                    borderRadius: "var(--site-radius-xl)",
                    border: "1px solid var(--site-border)",
                  }}
              >
                <div className={`icon-box ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 style={{ marginBottom: 8 }}>{title}</h3>
                  <p
                    style={{
                      color: "var(--site-text-secondary)",
                      lineHeight: 1.8,
                    }}
                  >
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ATUAÇÃO
      ══════════════════════════════════════════════ */}
      <section id="atuacao" className="glass-section-white section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Áreas de Atuação</span>
            <h2>
              Onde a OBGP{" "}
              <span
                className="font-cursive"
                style={{ color: "var(--site-gold-dark)" }}
              >
                atua
              </span>
            </h2>
            <p>
              Três eixos estratégicos para fortalecer políticas públicas e gerar
              impacto social real.
            </p>
            <div className="section-line" />
          </div>
          <div className="mobile-sticky-stack">
            {AREAS.map(
              (
                {
                  icon: Icon,
                  titulo,
                  subtitulo,
                  texto,
                  img,
                  bullets,
                  color,
                  bgColor,
                },
                i,
              ) => (
                <div
                  key={titulo}
                  className={`row-alternate sticky-item ${
                    i % 2 !== 0 ? "reverse" : ""
                  }`}
                  style={{
                    zIndex: i + 1,
                    background: "white",
                    padding: "32px 18px",
                    borderRadius: "var(--site-radius-xl)",
                  }}
                >
                  <div
                    style={{
                      borderRadius: "var(--site-radius-xl)",
                      overflow: "hidden",
                      position: "relative",
                      minHeight: 280,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={titulo}
                      className="img-cover"
                      style={{ height: "100%", position: "absolute", inset: 0 }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(135deg,rgba(0,0,0,0.35) 0%,transparent 65%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        padding: "7px 14px",
                        borderRadius: "var(--site-radius-full)",
                        background: "rgba(255,255,255,0.13)",
                        backdropFilter: "blur(12px)",
                        color: "white",
                        fontSize: ".7rem",
                        fontWeight: 700,
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                    >
                      <Icon size={12} /> {titulo}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--site-radius-md)",
                        background: bgColor,
                        color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 14,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <p className="overline" style={{ color, marginBottom: 5 }}>
                      {subtitulo}
                    </p>
                    <h3 className="h3-card" style={{ marginBottom: 12 }}>
                      {titulo}
                    </h3>
                    <p
                      style={{
                        color: "var(--site-text-secondary)",
                        lineHeight: 1.8,
                        marginBottom: 18,
                      }}
                    >
                      {texto}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 9,
                      }}
                    >
                      {bullets.map((b) => (
                        <div
                          key={b}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <CheckCircle2
                            size={14}
                            style={{ color, flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontSize: "var(--text-sm)",
                              color: "var(--site-text-secondary)",
                            }}
                          >
                            {b}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SERVIÇOS
      ══════════════════════════════════════════════ */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Nossos Serviços</span>
            <h2>
              Suporte técnico em todo o{" "}
              <span
                className="font-cursive"
                style={{ color: "var(--site-gold-dark)" }}
              >
                ciclo
              </span>
            </h2>
            <p>
              Da captação de recursos à prestação de contas — cobertura completa
              para OSCs que firmam parcerias entre a administração pública e as
              organizações da sociedade civil.
            </p>
            <div className="section-line" />
          </div>
          <div className="mobile-sticky-stack">
            {SERVICOS.map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={title}
                className={`glass-panel stagger-${i + 1} sticky-item`}
                style={{
                  padding: "36px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  position: "relative",
                  overflow: "hidden",
                  zIndex: i + 1,
                  background: "white",
                  borderRadius: "var(--site-radius-xl)",
                }}
              >
                <div
                  className="bg-number-visible"
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 16,
                    fontFamily: "var(--font-heading)",
                    fontSize: "3.5rem",
                    fontWeight: 900,
                    lineHeight: 1,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className={`icon-box ${color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 style={{ marginBottom: 7 }}>{title}</h4>
                  <p
                    style={{
                      color: "var(--site-text-secondary)",
                      fontSize: "var(--text-sm)",
                      lineHeight: 1.7,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <a href="/servicos" className="btn btn-primary">
              Ver todos os serviços <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SELO OSC — SPOTLIGHT
      ══════════════════════════════════════════════ */}
      <section className="glass-section-blue no-watermark" style={{ padding: "60px 0" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "45%",
            opacity: 0.04,
            background:
              "radial-gradient(circle at 80% 50%, white, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="row-alternate">
            <div>
              <div className="badge-gold" style={{ marginBottom: 22 }}>
                <Award size={12} /> Diferencial OBGP
              </div>
              <h2 style={{ color: "white", marginBottom: 14, lineHeight: 1.2 }}>
                Projeto <span className="hero-accent-white">"Selo OSC</span>{" "}
                Gestão de Parcerias"
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.8,
                  marginBottom: 22,
                }}
              >
                Mecanismo independente de certificação que atesta regularidade,
                conformidade e capacidade institucional das OSCs para parcerias
                com a administração pública — fundamentado nos arts. 22–32 da
                Lei nº 13.019/2014.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 11,
                  marginBottom: 32,
                }}
              >
                {[
                  "Regularização jurídica, fiscal, trabalhista e técnica",
                  "Aumento da segurança jurídica nas parcerias entre a administração pública e as organizações da sociedade civil",
                  "Redução de risco de inabilitação em chamamentos",
                  "Melhoria da eficiência operacional e transparência",
                  "Fortalecimento da capacidade de captação de recursos",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <CheckCircle2
                      size={15}
                      style={{
                        color: "var(--site-gold)",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "rgba(255,255,255,0.75)",
                        lineHeight: 1.6,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <a href="/selo-osc" className="btn btn-gold">
                Saiba mais sobre o Selo OSC <ArrowUpRight size={16} />
              </a>
            </div>

            {/* Visual */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <div style={{ position: "relative", width: "clamp(320px, 35vw, 480px)", height: "clamp(320px, 35vw, 480px)" }}>
                {/* Glow de fundo */}
                <div
                  style={{
                    position: "absolute",
                    inset: "10%",
                    background: "radial-gradient(circle, rgba(197,171,118,0.15) 0%, transparent 70%)",
                    animation: "pulseGlow 4s ease-in-out infinite",
                    borderRadius: "50%",
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "2px solid rgba(197,171,118,0.15)",
                    animation: "spin 40s linear infinite",
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: "8%",
                    borderRadius: "50%",
                    border: "2px dashed rgba(197,171,118,0.25)",
                    animation: "spin 25s linear infinite reverse",
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: "16%",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "inset 0 0 40px rgba(197,171,118,0.05)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: "22%",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                    border: "3px solid rgba(197,171,118,0.45)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow:
                      "0 0 80px rgba(197,171,118,0.25), inset 0 0 40px rgba(197,171,118,0.15)",
                    backdropFilter: "blur(16px)",
                    textAlign: "center",
                    padding: 20,
                  }}
                >
                  <Image
                    src="/logo.png"
                    alt="Selo OSC"
                    width={130}
                    height={130}
                    style={{
                      objectFit: "contain",
                      filter: "drop-shadow(0 0 20px rgba(197,171,118,0.6))",
                      marginBottom: "4px"
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900,
                      fontSize: "clamp(0.8rem, 2vw, 1.1rem)",
                      color: "var(--site-gold)",
                      letterSpacing: ".15em",
                      textTransform: "uppercase",
                      textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                    }}
                  >
                    Selo OSC
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)",
                      color: "rgba(255,255,255,0.8)",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Gestão de Parcerias
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          POR QUE A OBGP?
      ══════════════════════════════════════════════ */}
      <section className="section-padding section-watermark">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Por que a OBGP?</span>
            <h2>
              Mais que assessoria —{" "}
              <span
                className="font-cursive"
                style={{ color: "var(--site-gold-dark)" }}
              >
                execução
              </span>
            </h2>
            <p>
              Diferenciais que posicionam a OBGP como parceira estratégica de
              OSCs que buscam excelência.
            </p>
            <div className="section-line" />
          </div>
          <div className="mobile-sticky-stack">
            {DIFERENCIAIS.map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className={`glass-panel sticky-item stagger-${i + 1}`}
                style={{
                  padding: "28px 24px",
                  display: "flex",
                  gap: 18,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--site-radius-md)",
                    flexShrink: 0,
                    background: "var(--site-surface-blue)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--site-primary)",
                  }}
                >
                  <Icon size={21} />
                </div>
                <div>
                  <h3 style={{ marginBottom: 6, fontSize: "1rem" }}>{title}</h3>
                  <p
                    style={{
                      color: "var(--site-text-secondary)",
                      fontSize: "var(--text-sm)",
                      lineHeight: 1.75,
                    }}
                  >
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TRANSPARÊNCIA
      ══════════════════════════════════════════════ */}
      <section
        style={{ padding: "56px 0", background: "var(--site-surface-warm)" }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
              padding: "clamp(24px,3vw,40px) clamp(20px,4vw,44px)",
              borderRadius: "var(--site-radius-xl)",
              background: "white",
              border: "1px solid var(--site-border)",
              boxShadow: "var(--site-shadow-lg)",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "var(--site-radius-lg)",
                flexShrink: 0,
                background: "var(--site-surface-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--site-primary)",
              }}
            >
              <Lock size={26} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ marginBottom: 5, fontSize: "1.1rem" }}>
                Portal da Transparência
              </h3>
              <p
                style={{
                  color: "var(--site-text-secondary)",
                  fontSize: ".9rem",
                  lineHeight: 1.7,
                }}
              >
                Cumprindo o Art. 11 da Lei nº 13.019/2014 — todas as informações
                organizacionais e de parcerias estão disponíveis para consulta
                pública.
              </p>
            </div>
            <a
              href="/transparencia"
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
            >
              Acessar Portal <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CONTATO
      ══════════════════════════════════════════════ */}
      <section id="contato" className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Fale Conosco</span>
            <h2>
              Vamos{" "}
              <span
                className="font-cursive"
                style={{ color: "var(--site-gold-dark)" }}
              >
                conversar?
              </span>
            </h2>
            <p>
              Propostas de parceria, dúvidas institucionais ou qualquer assunto
              — estamos prontos para atender.
            </p>
            <div className="section-line" />
          </div>
          <div className="grid-3">
            {CHANNELS.map(
              ({ icon: Icon, title, info, sub, href, color }, i) => {
                const Tag = href ? "a" : "div";
                const extra = href
                  ? {
                      href,
                      target: href.startsWith("http")
                        ? ("_blank" as const)
                        : undefined,
                      rel: href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined,
                    }
                  : {};
                return (
                  <Tag
                    key={title}
                    {...extra}
                    className={`glass-panel stagger-${i + 1}`}
                    style={{
                      padding: "36px 26px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 18,
                      textDecoration: "none",
                      color: "inherit",
                      cursor: href ? "pointer" : "default",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {href && (
                      <ArrowUpRight
                        size={15}
                        style={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          color: "var(--site-text-tertiary)",
                          opacity: 0.4,
                        }}
                      />
                    )}
                    <div className={`icon-box ${color}`}>
                      <Icon size={21} />
                    </div>
                    <div>
                      <h3 style={{ marginBottom: 7, fontSize: "1rem" }}>
                        {title}
                      </h3>
                      <p
                        style={{
                          color: "var(--site-text-primary)",
                          fontWeight: 600,
                          fontSize: ".9rem",
                          wordBreak: "break-word",
                          marginBottom: 4,
                        }}
                      >
                        {info}
                      </p>
                      <p
                        style={{
                          color: "var(--site-text-tertiary)",
                          fontSize: ".82rem",
                        }}
                      >
                        {sub}
                      </p>
                    </div>
                  </Tag>
                );
              },
            )}
          </div>
          <div
            className="stagger-4"
            style={{
              marginTop: 36,
              padding: "clamp(18px,2.5vw,26px) clamp(18px,3vw,32px)",
              borderRadius: "var(--site-radius-lg)",
              background: "var(--site-surface-warm)",
              border: "1px solid var(--site-border)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "nowrap",
            }}
          >
            <div className="icon-box icon-box-gold" style={{ flexShrink: 0 }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: ".9rem", marginBottom: 2 }}>
                Horário de Atendimento
              </h3>
              <p
                style={{
                  color: "var(--site-text-secondary)",
                  fontSize: ".8rem",
                }}
              >
                Segunda a sexta-feira, <strong>8h às 17h</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════ */}
      <section
        className="glass-section-blue"
        style={{ padding: "56px 0", textAlign: "center" }}
      >
        <div className="container">
          <div className="badge-gold" style={{ marginBottom: 20 }}>
            <Star size={10} /> Pronto para o próximo passo?
          </div>
          <h2 style={{ color: "white", maxWidth: 520, margin: "0 auto 14px" }}>
            Fortaleça sua OSC com{" "}
            <span className="hero-accent-white">expertise</span> e conformidade
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,.62)",
              maxWidth: 480,
              margin: "0 auto 32px",
              lineHeight: 1.8,
              fontSize: "1rem",
            }}
          >
            Conheça os serviços e o Selo OSC que transformam a gestão de
            parcerias da sua organização.
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a href="/servicos" className="btn btn-white">
              Ver todos os serviços <ArrowRight size={16} />
            </a>
            <a href="/selo-osc" className="btn btn-gold">
              <Award size={15} /> Conhecer o Selo OSC
            </a>
            <a href="#contato" className="btn btn-outline-light">
              Falar com a equipe
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
