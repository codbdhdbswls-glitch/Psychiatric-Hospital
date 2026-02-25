import React, { useEffect, useState } from 'react';

const GLITCH_TEXTS = [
  "보지 마",
  "뒤를 봐",
  "진짜가 아니야",
  "일어나",
  "그들이 알아",
  "도망쳐",
  "NULL",
  "0xDEAD",
  "살려줘"
];

export const Glitch = ({ active, onComplete }: { active: boolean; onComplete: () => void }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    if (active) {
      setText(GLITCH_TEXTS[Math.floor(Math.random() * GLITCH_TEXTS.length)]);
      const timer = setTimeout(() => {
        onComplete();
      }, 200 + Math.random() * 300); // Short burst
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 z-[100] bg-red-900/20 flex items-center justify-center pointer-events-none overflow-hidden mix-blend-hard-light">
      <div className="absolute inset-0 bg-noise opacity-50 animate-pulse"></div>
      <h1 
        className="text-6xl md:text-9xl font-bold text-red-600 tracking-tighter transform scale-150 animate-bounce glitch-text"
        data-text={text}
      >
        {text}
      </h1>
      <div className="absolute top-0 left-0 w-full h-2 bg-white opacity-50 animate-scanline"></div>
    </div>
  );
};
