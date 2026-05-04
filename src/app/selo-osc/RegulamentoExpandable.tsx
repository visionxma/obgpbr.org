"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Mail, Phone } from "lucide-react";

export default function RegulamentoExpandable() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
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

        {/* 1. Objetivo */}
        <section style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary)", margin: "0 0 14px", fontFamily: "var(--font-heading)" }}>
            1. Objetivo
          </h4>
          <p style={{ margin: "0 0 12px" }}>
            <strong>Art. 1º.</strong> O presente Regulamento tem por objetivo instituir e regulamentar o <strong>Selo OSC Gestão de Parcerias</strong>, funcionando como instrumento técnico de aferição de conformidade normativa e excelência em governança institucional.
          </p>
          <p style={{ margin: 0 }}>
            <strong>Parágrafo único.</strong> O Selo visa mitigar riscos jurídicos e operacionais, promovendo a cultura de <em>accountability</em> e transparência, em estrita observância ao <em>art. 63 da Lei nº 13.019/2014</em>, assegurando que as Organizações da Sociedade Civil (OSCs) possuam estrutura administrativa e técnica compatível com a execução de políticas públicas em regime de mútua cooperação.
          </p>
        </section>

        {/* 2. Aplicação e Categorias de Análise */}
        <section style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary)", margin: "0 0 14px", fontFamily: "var(--font-heading)" }}>
            2. Aplicação e Categorias de Análise
          </h4>
          <p style={{ margin: "0 0 12px" }}>
            <strong>Art. 2º.</strong> O escopo de aplicação deste Regulamento restringe-se às Organizações da Sociedade Civil, conforme definidas na legislação federal, que manifestem interesse voluntário em comprovar sua aptidão jurídica, técnica e operacional para a celebração de parcerias com a Administração Pública.
          </p>
          <p style={{ margin: "0 0 12px" }}>
            <strong>Art. 3º.</strong> A aferição para concessão do Selo dar-se-á por meio da análise exauriente das seguintes categorias:
          </p>
          <ol style={{ margin: 0, paddingLeft: 22, listStyle: "none" }}>
            {[
              { num: "I.", titulo: "Habilitação Jurídica", texto: "Verificação da regularidade da constituição da OSC, incluindo estatuto social devidamente registrado, atas de eleição da diretoria e adequação do objeto social às atividades finalísticas propostas;" },
              { num: "II.", titulo: "Regularidade Fiscal, Social e Trabalhista", texto: "Comprovação da adimplência perante as fazendas públicas federal, estadual e municipal, bem como regularidade perante o FGTS e a Justiça do Trabalho;" },
              { num: "III.", titulo: "Qualificação Econômico-Financeira", texto: "Avaliação da saúde financeira através de balanços patrimoniais, demonstrações de resultados, cumprimento de obrigações contábeis (ITG 2002 R1) e efetividade do Conselho Fiscal;" },
              { num: "IV.", titulo: "Qualificação Técnica", texto: "Análise do portfólio institucional, atestados de capacidade técnica e comprovação de experiência prévia na execução de objetos similares ao de futuras parcerias;" },
              { num: "V.", titulo: "Outros Registros", texto: "Verificação de inscrições em conselhos de direitos (CMDCA, CMAS, etc.), alvarás de funcionamento e licenças sanitárias ou ambientais, conforme a natureza da atividade." },
            ].map((it) => (
              <li key={it.num} style={{ marginBottom: 8, paddingLeft: 0 }}>
                <strong>{it.num} {it.titulo}:</strong> {it.texto}
              </li>
            ))}
          </ol>
        </section>

        {/* 3. Referências Normativas */}
        <section style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary)", margin: "0 0 14px", fontFamily: "var(--font-heading)" }}>
            3. Referências Normativas
          </h4>
          <p style={{ margin: "0 0 12px" }}>
            <strong>Art. 4º.</strong> Este Regulamento fundamenta-se no ordenamento jurídico vigente, em especial:
          </p>
          <ul style={{ margin: 0, paddingLeft: 22, listStyle: "none" }}>
            <li style={{ marginBottom: 6 }}><strong>I. Lei nº 13.019/2014</strong> (Marco Regulatório das Organizações da Sociedade Civil — MROSC);</li>
            <li style={{ marginBottom: 6 }}><strong>II. Decreto Federal nº 8.726/2016</strong> (Regulamentação do MROSC em âmbito federal);</li>
            <li style={{ marginBottom: 6 }}><strong>III. Decreto Federal nº 11.948/2024</strong> (Alterações e atualizações procedimentais nas parcerias);</li>
            <li><strong>IV. Normas Brasileiras de Contabilidade</strong> aplicáveis às entidades sem fins lucrativos.</li>
          </ul>
        </section>

        {/* 4. Definições e Siglas */}
        <section style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary)", margin: "0 0 14px", fontFamily: "var(--font-heading)" }}>
            4. Definições e Siglas
          </h4>
          <p style={{ margin: "0 0 12px" }}>
            <strong>Art. 5º.</strong> Para os fins deste Regulamento, adotam-se as seguintes definições:
          </p>
          <ul style={{ margin: 0, paddingLeft: 22, listStyle: "none" }}>
            <li style={{ marginBottom: 8 }}><strong>I. OSC:</strong> Organização da Sociedade Civil, nos termos do art. 2º, inciso I, da Lei nº 13.019/2014;</li>
            <li style={{ marginBottom: 8 }}><strong>II. MROSC:</strong> Marco Regulatório das Organizações da Sociedade Civil;</li>
            <li style={{ marginBottom: 8 }}><strong>III. Certificação Independente:</strong> Processo de análise e validação realizado por entidade terceira desimpedida, visando atestar a conformidade da OSC;</li>
            <li style={{ marginBottom: 8 }}><strong>IV. Selo:</strong> Distintivo de qualidade e conformidade concedido após aprovação em processo avaliativo;</li>
            <li><strong>V. Relatório de Conformidade (RC):</strong> Documento técnico conclusivo que detalha os achados da auditoria e fundamenta a decisão de concessão ou denegação do Selo.</li>
          </ul>
        </section>

        {/* 5. Responsabilidades */}
        <section style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary)", margin: "0 0 14px", fontFamily: "var(--font-heading)" }}>
            5. Responsabilidades
          </h4>
          <p style={{ margin: "0 0 8px" }}>
            <strong>Art. 6º. Compete à Certificadora:</strong>
          </p>
          <ul style={{ margin: "0 0 16px", paddingLeft: 22, listStyle: "none" }}>
            <li style={{ marginBottom: 6 }}><strong>a)</strong> Atuar com imparcialidade, integridade e rigor técnico na análise documental;</li>
            <li style={{ marginBottom: 6 }}><strong>b)</strong> Emitir o Relatório de Conformidade (RC) no prazo de 30 (trinta) dias após o recebimento da documentação completa;</li>
            <li><strong>c)</strong> Garantir o sigilo das informações sensíveis e dados protegidos pela LGPD.</li>
          </ul>
          <p style={{ margin: "0 0 8px" }}>
            <strong>Art. 7º. Compete à OSC Solicitante:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: 22, listStyle: "none" }}>
            <li style={{ marginBottom: 6 }}><strong>a)</strong> Fornecer informações verídicas e documentos autênticos, sob as penas da lei;</li>
            <li style={{ marginBottom: 6 }}><strong>b)</strong> Manter atualizados seus registros e certidões durante todo o período de vigência do Selo;</li>
            <li><strong>c)</strong> Facilitar o acesso da equipe técnica a sistemas e arquivos necessários à validação.</li>
          </ul>
        </section>

        {/* 6. Detalhamento das Atividades */}
        <section style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary)", margin: "0 0 14px", fontFamily: "var(--font-heading)" }}>
            6. Detalhamento das Atividades
          </h4>
          <p style={{ margin: "0 0 12px" }}>
            <strong>Art. 8º.</strong> O procedimento operacional para obtenção do Selo observará as seguintes fases:
          </p>
          <ol style={{ margin: 0, paddingLeft: 22, listStyle: "none" }}>
            {[
              { num: "I.", titulo: "Solicitação", texto: "A OSC formaliza o pedido via sistema eletrônico, anexando o rol de documentos previstos no Art. 3º deste Regulamento;" },
              { num: "II.", titulo: "Triagem", texto: "Conferência preliminar da completude documental. Caso faltem documentos, a OSC será notificada para saneamento em até 05 (cinco) dias úteis;" },
              { num: "III.", titulo: "Análise Técnica", texto: "Avaliação de mérito jurídico, contábil e técnico. Nesta fase, podem ser solicitadas diligências ou entrevistas com os gestores da OSC;" },
              { num: "IV.", titulo: "Emissão do RC", texto: "Elaboração do Relatório de Conformidade, com parecer conclusivo pela concessão, concessão com ressalvas ou denegação;" },
              { num: "V.", titulo: "Homologação e Outorga", texto: "Publicação do resultado e entrega do Selo digital, com validade de 12 (doze) meses." },
            ].map((it) => (
              <li key={it.num} style={{ marginBottom: 8 }}>
                <strong>{it.num} {it.titulo}:</strong> {it.texto}
              </li>
            ))}
          </ol>
        </section>

        {/* 7. Gestão de Registros (RC) */}
        <section style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary)", margin: "0 0 14px", fontFamily: "var(--font-heading)" }}>
            7. Gestão de Registros (RC)
          </h4>
          <p style={{ margin: "0 0 12px" }}>
            <strong>Art. 9º.</strong> O Relatório de Conformidade (RC) é o registro mestre do processo de certificação.
          </p>
          <p style={{ margin: "0 0 10px" }}>
            <strong>§ 1º. Armazenamento:</strong> Os registros serão mantidos em repositório digital seguro, com criptografia de ponta a ponta e controle de acesso restrito aos técnicos responsáveis.
          </p>
          <p style={{ margin: "0 0 10px" }}>
            <strong>§ 2º. Proteção:</strong> A Certificadora implementará medidas de segurança para evitar a alteração, perda ou acesso não autorizado aos dados das OSCs, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </p>
          <p style={{ margin: 0 }}>
            <strong>§ 3º. Retenção:</strong> O RC e os documentos comprobatórios serão arquivados pelo prazo mínimo de 10 (dez) anos após o término da validade do Selo, para fins de fiscalização pelos órgãos de controle (Tribunais de Contas e Ministério Público).
          </p>
        </section>

        {/* 8. Controle de Alterações */}
        <section style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary)", margin: "0 0 14px", fontFamily: "var(--font-heading)" }}>
            8. Controle de Alterações
          </h4>
          <p style={{ margin: "0 0 16px" }}>
            <strong>Art. 10.</strong> Este Regulamento poderá ser revisado anualmente ou sempre que houver alteração legislativa que impacte o regime jurídico das parcerias.
          </p>
          <div style={{ overflowX: "auto", borderRadius: "var(--site-radius-md)", border: "1px solid var(--site-border)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "var(--site-surface-warm)" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "var(--site-primary)", borderBottom: "1px solid var(--site-border)" }}>Versão</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "var(--site-primary)", borderBottom: "1px solid var(--site-border)" }}>Data</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "var(--site-primary)", borderBottom: "1px solid var(--site-border)" }}>Descrição da Alteração</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "var(--site-primary)", borderBottom: "1px solid var(--site-border)" }}>Responsável</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "12px 14px", verticalAlign: "top" }}>1.0</td>
                  <td style={{ padding: "12px 14px", verticalAlign: "top", whiteSpace: "nowrap" }}>30/04/2026</td>
                  <td style={{ padding: "12px 14px", verticalAlign: "top" }}>Emissão inicial e adequação ao Decreto nº 11.948/2024.</td>
                  <td style={{ padding: "12px 14px", verticalAlign: "top" }}>Equipe Técnica Administrador RT e Contador RT.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Rodapé / Assinatura */}
        <footer style={{
          marginTop: 40,
          paddingTop: 28,
          borderTop: "1px solid var(--site-border)",
          textAlign: "center",
          color: "var(--site-text-secondary)",
          fontSize: "0.82rem",
          lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 800, color: "var(--site-primary)", fontSize: "0.92rem", marginBottom: 12 }}>
            Organização Brasil Gestão de Parcerias — OBGP
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 18px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <MapPin size={13} /> Avenida L, Nº 10 D, Quadra 32, Bairro Morada do Sol — Paço do Lumiar/MA, CEP 65130-000
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Mail size={13} /> contato.org.obgp@gmail.com
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Phone size={13} /> (98) 9 8710-0001
            </span>
          </div>
        </footer>

        {/* Fade Out Effect */}
        {!isExpanded && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "120px",
              background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 90%)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* Botão Saiba Mais */}
      <div style={{ textAlign: "center", marginTop: isExpanded ? 24 : -10, position: "relative", zIndex: 1 }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 24px",
            background: isExpanded ? "var(--site-surface-warm)" : "var(--site-gold)",
            color: isExpanded ? "var(--site-primary)" : "#fff",
            border: isExpanded ? "1px solid var(--site-border)" : "none",
            borderRadius: "var(--site-radius-full)",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: isExpanded ? "none" : "0 4px 14px rgba(197, 171, 118, 0.4)",
          }}
          onMouseEnter={(e) => {
            if (!isExpanded) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(197, 171, 118, 0.6)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isExpanded) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(197, 171, 118, 0.4)";
            }
          }}
        >
          {isExpanded ? (
            <>
              Ocultar regulamento <ChevronUp size={18} />
            </>
          ) : (
            <>
              Saiba mais... <ChevronDown size={18} />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
