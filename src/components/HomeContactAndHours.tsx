import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantInfo';
import type { NavView } from './Navbar';
import { useViewportEntrance } from '../utils/useViewportEntrance';

interface HomeContactAndHoursProps {
  onNavigate?: (view: NavView) => void;
}

export const HomeContactAndHours: React.FC<HomeContactAndHoursProps> = () => {
  const { ref, entranceClassName } = useViewportEntrance<HTMLDivElement>();
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    'La Tentación Burger, Grupo San Diego, Fase 7, 41015 Sevilla'
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="contacto-horarios" className="py-4 sm:py-6 bg-transparent relative">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${entranceClassName}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          {/* =================================================================== */}
          {/* CARD 1: MAIN CONTACT AND LOCATION CARD (WITH INTERACTIVE MAP)      */}
          {/* Mobile: below opening hours (order-2); Desktop: left (lg:order-1)  */}
          {/* =================================================================== */}
          <div className="order-2 lg:order-1 embossed-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-600/15 border border-white/10 text-red-500 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 font-mono block">
                  VISÍTANOS EN SEVILLA
                </span>
                <p className="text-xs text-zinc-400 font-medium italic mt-0.5">
                  &ldquo;{RESTAURANT_INFO.slogan}&rdquo;
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase embossed-text-3d">
                  La barriada de San Diego
                </h3>
              </div>
            </div>

            {/* Embedded Interactive Google Map */}
            <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.85)] bg-[#0c0c12]">
              <iframe
                title="Mapa interactivo de ubicación de La Tentación Burger en Barriada de San Diego, Sevilla"
                src={googleMapsEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Direct Call Action */}
            <div className="flex items-center pt-1">
              <a
                href={`tel:${RESTAURANT_INFO.phone.international}`}
                aria-label={`Llamar a La Tentación Burger al ${RESTAURANT_INFO.phone.display}`}
                className="embossed-btn-red inline-flex items-center justify-center gap-2 px-5 py-3 text-white text-xs font-bold uppercase tracking-wider rounded-xl font-mono cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>LLAMAR</span>
              </a>
            </div>
          </div>

          {/* =================================================================== */}
          {/* CARD 2: OPENING-HOURS CARD (WITHOUT DUPLICATE TELEPHONE NUMBER)    */}
          {/* Mobile: first above map (order-1); Desktop: right (lg:order-2)     */}
          {/* =================================================================== */}
          <div className="order-1 lg:order-2 embossed-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1f1f2c] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-red-600/15 border border-white/10 text-red-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-mono block">
                      Horarios de Apertura
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold uppercase text-white embossed-text-3d">
                      Servicio en Local y Recogida
                    </h3>
                  </div>
                </div>
              </div>

              {/* Schedule list */}
              <div className="divide-y divide-[#1d1d28]">
                {RESTAURANT_INFO.schedule.map((slot) => (
                  <div
                    key={slot.day}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200">{slot.day}</span>
                      {slot.note && (
                        <span className="text-[10px] text-zinc-400 italic">
                          ({slot.note})
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-mono text-xs ${
                        slot.shifts === 'Consultar'
                          ? 'text-amber-400 font-semibold'
                          : 'text-zinc-300'
                      }`}
                    >
                      {slot.shifts}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#14141f] border border-[#232333] text-[11px] text-zinc-400 leading-relaxed">
              <strong className="text-zinc-200">Lunes:</strong> Horario no suministrado por el establecimiento; por favor consultar directamente antes de acudir.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
