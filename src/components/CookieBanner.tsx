import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck } from 'lucide-react';
import type { LegalTab } from './LegalModal';

interface CookieBannerProps {
  onOpenLegal: (tab: LegalTab) => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenLegal }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('la_tentacion_cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // localStorage may be disabled in private mode
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('la_tentacion_cookie_consent', 'accepted_all');
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    try {
      localStorage.setItem('la_tentacion_cookie_consent', 'only_necessary');
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Aviso de cookies y privacidad"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-lg z-50 p-4 sm:p-5 rounded-2xl bg-[#0f0f17]/95 border border-[#2a2a3e] shadow-2xl backdrop-blur-md text-zinc-300 text-xs font-sans"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-red-600/15 border border-red-600/30 text-red-500 shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="font-bold text-white text-sm flex items-center gap-1.5">
            <span>Uso de cookies y privacidad</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
            Utilizamos cookies técnicas y almacenamiento local estrictamente necesarios para el funcionamiento de la carta digital y el carrito de pedidos de recogida. No utilizamos cookies de perfilado publicitario invasivo.{' '}
            <button
              type="button"
              onClick={() => onOpenLegal('cookies')}
              className="text-red-400 underline font-medium hover:text-red-300 transition-colors cursor-pointer"
            >
              Más información
            </button>
            .
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
            >
              Aceptar todas
            </button>
            <button
              type="button"
              onClick={handleAcceptNecessary}
              className="px-3.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#222232] border border-[#2e2e42] text-zinc-200 font-semibold text-xs cursor-pointer transition-colors"
            >
              Solo necesarias
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
