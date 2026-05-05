'use client';

import { useEffect } from 'react';

/**
 * Bloqueia em todo o site: menu de contexto (right-click), atalhos de
 * DevTools (F12, Ctrl+Shift+I/J/C, Ctrl+U), cópia (Ctrl+C / menu) e
 * arrastar de imagens. Permite cópia normal em <input>/<textarea>
 * para que formulários continuem funcionais.
 */
export default function SecurityGuard() {
  useEffect(() => {
    // 1. Right-click → bloqueia "Inspecionar", "Salvar imagem", "Copiar imagem", etc.
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Atalhos de DevTools / view-source / save
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      // F12 — DevTools
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+I / J / C — abrir DevTools / Console / Element picker
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === 'I' || k === 'J' || k === 'C')) {
        e.preventDefault();
        return;
      }
      // Ctrl+U — view source
      if ((e.ctrlKey || e.metaKey) && k === 'U') {
        e.preventDefault();
        return;
      }
      // Ctrl+S — save page
      if ((e.ctrlKey || e.metaKey) && k === 'S') {
        e.preventDefault();
        return;
      }
    };

    // 3. Bloqueia cópia exceto em campos de formulário
    const onCopy = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      const editable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        (t instanceof HTMLElement && t.isContentEditable);
      if (!editable) {
        e.preventDefault();
      }
    };

    // 4. Bloqueia arrastar/salvar imagens
    const onDragStart = (e: DragEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCopy);
    document.addEventListener('dragstart', onDragStart);

    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCopy);
      document.removeEventListener('dragstart', onDragStart);
    };
  }, []);

  return null;
}
