'use client';
import { useRef } from 'react';

interface Props {
  imgStyle?: React.CSSProperties;
}

export default function MascoteInterativo({ imgStyle }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
    const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    const rx = -dy * 14;
    const ry =  dx * 14;
    el.style.transition = 'transform 0.08s ease-out';
    el.style.transform   = `perspective(520px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.07)`;
  };

  const onLeave = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.45s cubic-bezier(.22,1,.36,1)';
    el.style.transform   = 'perspective(520px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  const onClick = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.08s ease-in';
    el.style.transform   = 'perspective(520px) scale(0.9) rotateZ(-4deg)';
    setTimeout(() => {
      el.style.transition = 'transform 0.5s cubic-bezier(.34,1.56,.64,1)';
      el.style.transform   = 'perspective(520px) rotateX(0deg) rotateY(0deg) scale(1) rotateZ(0deg)';
    }, 120);
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        display: 'inline-block',
        cursor: 'pointer',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
      }}
    >
      <img
        src="/img/mascote-selo.webp"
        alt=""
        width={320}
        height={320}
        className="mascote mascote-float"
        style={{ display: 'block', ...imgStyle }}
        draggable={false}
      />
    </div>
  );
}
