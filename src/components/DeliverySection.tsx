import React from 'react';
import { ExternalLink, CheckCircle, Clock3 } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantInfo';

interface DeliverySectionProps {
  onGoToMenu?: () => void;
  onGoToHome?: () => void;
}

export const DeliverySection: React.FC<DeliverySectionProps> = () => {
  const { glovo, justEat, uberEats } = RESTAURANT_INFO.delivery;

  return (
    <section className="py-12 sm:py-20 bg-transparent relative min-h-[80vh] flex items-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Main 3D Embossed Delivery Container */}
        <div className="embossed-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-white embossed-text-3d">
              Pedidos a domicilio
            </h1>
          </div>

          {/* ================================================================= */}
          {/* THREE PROMINENT PLATFORM CARDS SIDE BY SIDE                       */}
          {/* Uber Eats | Glovo | Just Eat                                      */}
          {/* Horizontal row on desktop, responsive compact cards on mobile    */}
          {/* ================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* ------------------------------------------------------------- */}
            {/* CARD 1: UBER EATS                                             */}
            {/* ------------------------------------------------------------- */}
            <div className="embossed-card rounded-2xl p-6 flex flex-col justify-between group hover:border-[#06C167]/40 transition-all">
              <div>
                {/* Brand Header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  {/* Uber Eats recognizable typography mark */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-2xl sm:text-3xl font-black text-white tracking-wide">
                      Uber
                    </span>
                    <span className="font-display text-2xl sm:text-3xl font-black text-[#06C167] tracking-wide">
                      Eats
                    </span>
                  </div>

                  {uberEats.isConfigured ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Activo</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 rounded-full">
                      Configuración
                    </span>
                  )}
                </div>

                {/* Platform Icon & Description */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#06C167]/15 border border-[#06C167]/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#06C167]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" opacity="0.3"/>
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-semibold text-zinc-300 block">
                      Entrega rápida Uber Eats
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {uberEats.isConfigured ? 'Enlace verificado' : 'Enlace pendiente de configurar'}
                    </span>
                  </div>
                </div>

                {/* Informative note */}
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  {uberEats.isConfigured
                    ? 'Pide nuestras burgers a través de la tienda oficial en Uber Eats.'
                    : 'El enlace directo a la tienda de Uber Eats está pendiente de configuración en restaurantInfo.ts.'}
                </p>
              </div>

              {/* Action Area */}
              <div>
                {uberEats.isConfigured && uberEats.url ? (
                  <a
                    href={uberEats.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-[#06C167] hover:bg-[#05a759] text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <span>Pedir en Uber Eats</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    disabled
                    title="Configura la URL en restaurantInfo.ts para habilitar este botón"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-[#181824] text-zinc-500 font-bold uppercase tracking-wider text-xs rounded-xl border border-white/5 cursor-not-allowed opacity-80"
                  >
                    <span>Pendiente de enlace</span>
                  </button>
                )}
                <span className="text-[10px] text-zinc-500 text-center block mt-2 font-mono">
                  {uberEats.isConfigured ? 'Apertura en nueva pestaña' : 'Configurable en restaurantInfo.ts'}
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 2: GLOVO (Verified & Configured)                         */}
            {/* ------------------------------------------------------------- */}
            <div className="embossed-card rounded-2xl p-6 flex flex-col justify-between group hover:border-[#FFC244]/50 transition-all ring-1 ring-[#FFC244]/20">
              <div>
                {/* Brand Header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  {/* Glovo authentic brand treatment */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#FFC244] flex items-center justify-center text-zinc-950 font-black text-sm shadow-md">
                      G
                    </div>
                    <span className="font-display text-2xl sm:text-3xl font-black text-[#FFC244] tracking-wide">
                      Glovo
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-3 h-3 text-amber-400" />
                    <span>Oficial Sevilla</span>
                  </span>
                </div>

                {/* Platform Icon & Description */}
                <div className="p-3 rounded-xl bg-black/40 border border-[#FFC244]/20 mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FFC244]/20 border border-[#FFC244]/40 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#FFC244]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-semibold text-zinc-200 block">
                      Tienda oficial de Sevilla
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      La Tentación Burger Sevilla
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                  Pide directamente a través de nuestra tienda verificada en Glovo para disfrutar de tus smash burgers en casa.
                </p>
              </div>

              {/* Action Area */}
              <div>
                <a
                  href={glovo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir tienda oficial de La Tentación Burger en Glovo"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-[#FFC244] hover:bg-[#ffb624] text-zinc-950 font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-950/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>Pedir en Glovo</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-950" />
                </a>
                <span className="text-[10px] text-amber-400/80 text-center block mt-2 font-mono">
                  Enlace oficial disponible
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 3: JUST EAT                                              */}
            {/* ------------------------------------------------------------- */}
            <div className="embossed-card rounded-2xl p-6 flex flex-col justify-between group hover:border-[#FF8000]/40 transition-all">
              <div>
                {/* Brand Header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  {/* Just Eat brand treatment */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FF8000] flex items-center justify-center text-white font-black text-xs shadow-md">
                      JE
                    </div>
                    <span className="font-display text-2xl sm:text-3xl font-black text-white tracking-wide">
                      JUST <span className="text-[#FF8000]">EAT</span>
                    </span>
                  </div>

                  {justEat.isConfigured ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Activo</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock3 className="w-3 h-3 text-zinc-400" />
                      <span>Próximamente</span>
                    </span>
                  )}
                </div>

                {/* Platform Icon & Description */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 mb-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FF8000]/15 border border-[#FF8000]/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#FF8000]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-semibold text-zinc-300 block">
                      Entrega Just Eat
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {justEat.isConfigured ? 'Enlace verificado' : 'Enlace pendiente de configurar'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  {justEat.isConfigured
                    ? 'Pide a través de nuestra tienda oficial en Just Eat.'
                    : 'El enlace directo a la tienda en Just Eat está pendiente de asignación oficial por el establecimiento.'}
                </p>
              </div>

              {/* Action Area */}
              <div>
                {justEat.isConfigured && justEat.url ? (
                  <a
                    href={justEat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-[#FF8000] hover:bg-[#e67300] text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-orange-950/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <span>Pedir en Just Eat</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    disabled
                    title="Configura la URL en restaurantInfo.ts para habilitar este botón"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-[#181824] text-zinc-500 font-bold uppercase tracking-wider text-xs rounded-xl border border-white/5 cursor-not-allowed opacity-80"
                  >
                    <span>Próximamente</span>
                  </button>
                )}
                <span className="text-[10px] text-zinc-500 text-center block mt-2 font-mono">
                  {justEat.isConfigured ? 'Apertura en nueva pestaña' : 'Configurable en restaurantInfo.ts'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
