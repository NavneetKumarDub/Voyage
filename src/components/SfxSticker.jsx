import React, { useMemo } from 'react';

export default function SfxSticker({ text, color = '#FFD23F', className = '' }) {
  const rotation = useMemo(() => Math.floor(Math.random() * 20) - 10, [text]);
  const size = useMemo(() => (text.length > 5 ? 'text-2xl' : 'text-3xl'), [text]);

  return (
    <div
      className={`sfx-burst flex items-center justify-center ${className}`}
      style={{
        background: color,
        width: 110,
        height: 110,
        transform: `rotate(${rotation}deg)`,
        border: 'none'
      }}
    >
      <span
        className={`font-bangers ${size} tracking-wider`}
        style={{
          color: '#0D1B2A',
          textShadow: '2px 2px 0 #fff, -1px -1px 0 #fff'
        }}
      >
        {text}
      </span>
    </div>
  );
}
