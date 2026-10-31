import React, { useEffect } from 'react';

export const AuthTransitionLoader = ({ onFinish }) => {
  useEffect(() => {
    // Ultra-snappy transition: 500ms and done
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0C0E] flex items-center justify-center select-none animate-in fade-in duration-150">
      {/* Subtle emerald ambient blur */}
      <div className="absolute w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Solo el logo de Autify con pulso sutil */}
      <div className="relative animate-pulse">
        <img
          src="/images/autify-logo.png"
          alt="Autify"
          className="h-12 sm:h-14 w-auto object-contain filter drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        />
      </div>
    </div>
  );
};
