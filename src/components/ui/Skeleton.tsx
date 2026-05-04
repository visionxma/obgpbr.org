import React from 'react';

export function Skeleton({ width, height, borderRadius, style, className }: { width?: string | number, height?: string | number, borderRadius?: string | number, style?: React.CSSProperties, className?: string }) {
  return (
    <div
      className={`skeleton-loader ${className || ''}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: borderRadius || '8px',
        ...style
      }}
    />
  );
}
