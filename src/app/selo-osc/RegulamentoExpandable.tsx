"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Mail, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Secao {
  titulo: string;
  conteudo: string;
}

interface RegulamentoData {
  versao: string;
  versao_data: string;
  versao_descricao: string | null;
  versao_responsavel: string | null;
  secoes: Secao[];
  footer_endereco: string | null;
  footer_email: string | null;
  footer_telefone: string | null;
}

export default function RegulamentoExpandable() {
  const topRef = useRef<HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<RegulamentoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("regulamento_conteudo")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data: row }) => {
        if (row) setData(row as RegulamentoData);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        background: "#fff",
        border: "1px solid var(--site-border)",
        borderRadius: "var(--site-radius-xl)",
        boxShadow: "var(--site-shadow-xs)",
        padding: "clamp(24px, 5vw, 56px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 200, gap: 12, color: "var(--site-text-secondary)", fontSize: "0.9rem",
      }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "var(--site-primary)" }} />
        Carregando regulamento…
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) return null;

  return (
    <article
      ref={topRef}
      style={{
        background: "#fff",
        border: "1px solid var(--site-border)",
        borderRadius: "var(--site-radius-xl)",
        boxShadow: "var(--site-shadow-xs)",
        padding: "clamp(24px, 5vw, 56px)",
        color: "var(--site-text-primary)",
        lineHeight: 1.75,
        fontSize: "0.95rem",
        position: "relative",
      }}
    >
      <div
        style={{
          maxHeight: isExpanded ? "none" : "380px",
          overflow: "hidden",
          position: "relative",
          transition: "max-height 0.5s ease",
        }}
      >
        {data.secoes.map((sec, idx) => (
          <section key={idx} style={{ marginBottom: 32 }}>
            <h4 style={{
              fontSize: "1.05rem", fontWeight: 800,
              color: "var(--site-primary)", margin: "0 0 14px",
              fontFamily: "var(--font-heading)",
            }}>
              {sec.titulo}
            </h4>
            <div
              className="regulamento-secao"
              dangerouslySetInnerHTML={{ __html: sec.conteudo }}
            />
          </section>
        ))}

        {/* Rodapé */}
        <footer style={{
          marginTop: 40, paddingTop: 28,
          borderTop: "1px solid var(--site-border)",
          textAlign: "center",
          color: "var(--site-text-secondary)",
          fontSize: "0.82rem", lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 800, color: "var(--site-primary)", fontSize: "0.92rem", marginBottom: 12 }}>
            Organização Brasil Gestão de Parcerias — OBGP
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 18px" }}>
            {data.footer_endereco && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MapPin size={13} /> {data.footer_endereco}
              </span>
            )}
            {data.footer_email && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Mail size={13} /> {data.footer_email}
              </span>
            )}
            {data.footer_telefone && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Phone size={13} /> {data.footer_telefone}
              </span>
            )}
          </div>
        </footer>

        {/* Fade out */}
        {!isExpanded && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "120px",
            background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 90%)",
            pointerEvents: "none",
          }} />
        )}
      </div>

      {/* Botão expandir/recolher */}
      <div style={{ textAlign: "center", marginTop: isExpanded ? 24 : -10, position: "relative", zIndex: 1 }}>
        <button
          onClick={() => {
            const next = !isExpanded;
            setIsExpanded(next);
            if (!next) {
              setTimeout(() => {
                topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
            }
          }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 24px",
            background: isExpanded ? "var(--site-surface-warm)" : "var(--site-gold)",
            color: isExpanded ? "var(--site-primary)" : "#fff",
            border: isExpanded ? "1px solid var(--site-border)" : "none",
            borderRadius: "var(--site-radius-full)",
            fontWeight: 700, fontSize: "0.9rem",
            cursor: "pointer", transition: "all 0.3s ease",
            boxShadow: isExpanded ? "none" : "0 4px 14px rgba(197, 171, 118, 0.4)",
          }}
          onMouseEnter={e => {
            if (!isExpanded) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(197, 171, 118, 0.6)";
            }
          }}
          onMouseLeave={e => {
            if (!isExpanded) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(197, 171, 118, 0.4)";
            }
          }}
        >
          {isExpanded ? <><span>Ocultar regulamento</span> <ChevronUp size={18} /></> : <><span>Saiba mais…</span> <ChevronDown size={18} /></>}
        </button>
      </div>

      <style>{`
        .regulamento-secao p { margin: 0 0 12px; }
        .regulamento-secao p:last-child { margin-bottom: 0; }
        .regulamento-secao ul, .regulamento-secao ol { margin: 0; padding-left: 22px; list-style: none; }
        .regulamento-secao li { margin-bottom: 8px; }
        .regulamento-secao li:last-child { margin-bottom: 0; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </article>
  );
}
