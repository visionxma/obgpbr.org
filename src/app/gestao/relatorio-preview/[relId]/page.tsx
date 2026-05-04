'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RelatorioPreviewPage() {
  const { relId } = useParams<{ relId: string }>();
  const router = useRouter();

  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [iframeHeight, setIframeHeight] = useState(1400);
  const [iframeReady, setIframeReady]   = useState(false);

  /* ── Assinatura ── */
  const [sigSrc,      setSigSrc]      = useState<string | null>(null);
  const [sigFileName, setSigFileName] = useState('');
  const [sigPos,      setSigPos]      = useState({ x: 150, y: 720 });
  const [sigSize,     setSigSize]     = useState({ w: 200, h: 80 });
  const [dragging,    setDragging]    = useState(false);
  const [selected,    setSelected]    = useState(false);
  const [hint,        setHint]        = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  /* ── Resize iframe ao conteúdo ── */
  const resizeIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
    // Ocultar botão de impressão interno
    const btn = iframe.contentDocument.querySelector('.no-print') as HTMLElement | null;
    if (btn) btn.style.display = 'none';
    const h = iframe.contentDocument.documentElement.scrollHeight;
    setIframeHeight(Math.max(h, 1200));
    setIframeReady(true);
  }, []);

  /* ── Interceptar CTRL+F ── */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        e.stopImmediatePropagation();
        fileInputRef.current?.click();
      }
      // Setas para mover assinatura com precisão
      if (selected && sigSrc) {
        const step = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowLeft')  { e.preventDefault(); setSigPos(p => ({ ...p, x: p.x - step })); }
        if (e.key === 'ArrowRight') { e.preventDefault(); setSigPos(p => ({ ...p, x: p.x + step })); }
        if (e.key === 'ArrowUp')    { e.preventDefault(); setSigPos(p => ({ ...p, y: p.y - step })); }
        if (e.key === 'ArrowDown')  { e.preventDefault(); setSigPos(p => ({ ...p, y: p.y + step })); }
        if (e.key === 'Delete' || e.key === 'Escape') { setSigSrc(null); setSigFileName(''); setSelected(false); }
      }
    };
    window.addEventListener('keydown', handle, { capture: true });
    return () => window.removeEventListener('keydown', handle, { capture: true });
  }, [selected, sigSrc]);

  /* ── Selecionar arquivo ── */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSigFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      setSigSrc(ev.target?.result as string);
      setSelected(true);
      setHint(true);
      setTimeout(() => setHint(false), 5000);
      // Posição padrão: centro horizontal, próximo à área de assinatura
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setSigPos({ x: Math.round(w / 2) - 100, y: 760 });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /* ── Drag ── */
  const handleSigMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(true);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left - sigPos.x,
      y: e.clientY - rect.top  - sigPos.y,
    };
    setDragging(true);
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSigPos({
        x: Math.round(e.clientX - rect.left - dragOffset.current.x),
        y: Math.round(e.clientY - rect.top  - dragOffset.current.y),
      });
    };
    const up = () => setDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',   up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [dragging]);

  /* ── Clicar fora desseleciona ── */
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('#sig-overlay-img')) setSelected(false);
  };

  /* ── Imprimir ── */
  const handlePrint = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !iframe.contentWindow) return;
    const doc = iframe.contentDocument;

    // Remover injeção anterior
    doc.getElementById('__sig_print')?.remove();

    if (sigSrc) {
      doc.body.style.position = 'relative';
      const img = doc.createElement('img');
      img.id = '__sig_print';
      img.src = sigSrc;
      img.style.cssText = [
        'position:absolute',
        `left:${sigPos.x}px`,
        `top:${sigPos.y}px`,
        `width:${sigSize.w}px`,
        `height:${sigSize.h}px`,
        'object-fit:contain',
        'z-index:9999',
      ].join(';');
      doc.body.appendChild(img);
    }

    iframe.contentWindow.print();

    // Limpar após impressão
    setTimeout(() => doc.getElementById('__sig_print')?.remove(), 2000);
  };

  /* ── Render ── */
  return (
    <>
      <style>{`
        html, body { margin:0; padding:0; background:#d1d5db; }
        @media print {
          .preview-toolbar, .preview-hint { display:none!important; }
          html, body { background:#fff; }
        }
        #sig-overlay-img {
          touch-action: none;
          -webkit-user-drag: none;
        }
        #sig-overlay-img.selected {
          outline: 2px dashed #C5AB76;
          outline-offset: 2px;
        }
      `}</style>

      {/* ── Toolbar ── */}
      <div className="preview-toolbar" style={{
        position: 'sticky', top: 0, zIndex: 300,
        background: '#0D364F', color: '#fff',
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,.3)',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: '.8rem', whiteSpace: 'nowrap' }}
        >
          ← Voltar
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            background: 'rgba(197,171,118,.15)', border: '1px solid rgba(197,171,118,.35)',
            color: '#C5AB76', padding: '5px 14px', borderRadius: 6, fontSize: '.78rem', fontWeight: 700,
          }}>
            <kbd style={{ background: 'rgba(255,255,255,.15)', padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace', fontWeight: 900 }}>CTRL+F</kbd>
            {' '}— inserir assinatura digital
          </span>

          {sigSrc && (
            <span style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.85)', display: 'flex', alignItems: 'center', gap: 6 }}>
              ✓ <strong>{sigFileName}</strong>
            </span>
          )}
        </div>

        {/* Controles de tamanho */}
        {sigSrc && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.07)', borderRadius: 8, padding: '4px 12px' }}>
            <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>Tamanho:</span>
            <button onClick={() => setSigSize(s => ({ w: Math.max(60, s.w - 20), h: Math.max(24, s.h - 8) }))}
              style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: 4, cursor: 'pointer', fontWeight: 900, fontSize: '1rem' }}>−</button>
            <span style={{ fontSize: '.78rem', color: '#fff', minWidth: 60, textAlign: 'center' }}>{sigSize.w}×{sigSize.h}</span>
            <button onClick={() => setSigSize(s => ({ w: s.w + 20, h: s.h + 8 }))}
              style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: 4, cursor: 'pointer', fontWeight: 900, fontSize: '1rem' }}>+</button>
            <button onClick={() => { setSigSrc(null); setSigFileName(''); setSelected(false); }}
              style={{ background: 'rgba(239,68,68,.2)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5', padding: '3px 10px', borderRadius: 5, cursor: 'pointer', fontSize: '.72rem', fontWeight: 700, marginLeft: 4 }}>
              Remover
            </button>
          </div>
        )}

        <button
          onClick={handlePrint}
          disabled={!iframeReady}
          style={{
            background: iframeReady ? '#C5AB76' : 'rgba(255,255,255,.2)',
            border: 'none', color: '#0D364F',
            padding: '8px 20px', borderRadius: 8, cursor: iframeReady ? 'pointer' : 'default',
            fontWeight: 800, fontSize: '.85rem', whiteSpace: 'nowrap',
          }}
        >
          🖨 Imprimir / Salvar PDF
        </button>
      </div>

      {/* ── Hint ── */}
      {hint && sigSrc && (
        <div className="preview-hint" style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: '#0D364F', color: '#fff', padding: '10px 20px', borderRadius: 10,
          zIndex: 400, fontWeight: 600, fontSize: '.85rem',
          boxShadow: '0 4px 20px rgba(0,0,0,.35)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          ✋ Arraste a assinatura para posicioná-la — use as setas para precisão de 1 px
        </div>
      )}

      {/* ── Container do documento ── */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        style={{ position: 'relative', maxWidth: 900, margin: '24px auto 60px', background: '#fff', boxShadow: '0 4px 30px rgba(0,0,0,.15)' }}
      >
        {/* Loading */}
        {!iframeReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(255,255,255,.9)', minHeight: 300 }}>
            <span style={{ fontSize: '.9rem', color: '#6b7280', fontWeight: 600 }}>Carregando documento…</span>
          </div>
        )}

        {/* Iframe com o relatório */}
        <iframe
          ref={iframeRef}
          src={`/api/relatorio/pdf/${relId}`}
          style={{ width: '100%', height: iframeHeight, border: 'none', display: 'block' }}
          onLoad={resizeIframe}
          title="Pré-visualização do Relatório"
        />

        {/* Cobertura transparente ao arrastar (evita que iframe capture o mouse) */}
        {dragging && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 200, cursor: 'grabbing' }} />
        )}

        {/* Overlay da assinatura */}
        {sigSrc && (
          <img
            id="sig-overlay-img"
            src={sigSrc}
            alt="Assinatura Digital"
            className={selected ? 'selected' : ''}
            onMouseDown={handleSigMouseDown}
            draggable={false}
            style={{
              position: 'absolute',
              left: sigPos.x,
              top:  sigPos.y,
              width:  sigSize.w,
              height: sigSize.h,
              objectFit: 'contain',
              cursor: dragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              zIndex: 150,
              background: 'rgba(255,255,255,.6)',
              borderRadius: 4,
              padding: 3,
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.2))',
            }}
          />
        )}

        {/* Indicador de posição (quando selecionada) */}
        {sigSrc && selected && (
          <div style={{
            position: 'absolute',
            left: sigPos.x,
            top:  sigPos.y + sigSize.h + 6,
            background: '#0D364F', color: '#fff',
            fontSize: '.65rem', fontWeight: 700,
            padding: '2px 8px', borderRadius: 4, zIndex: 160,
            pointerEvents: 'none', whiteSpace: 'nowrap',
          }}>
            x:{sigPos.x} y:{sigPos.y} — Setas = mover 1px | Shift+Setas = 10px | Del = remover
          </div>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </>
  );
}
