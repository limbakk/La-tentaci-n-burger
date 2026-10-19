import React from 'react';
import { Phone, Clock, Instagram } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantInfo';

interface LocationSectionProps {
  onGoToHome?: () => void;
  onGoToMenu?: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = () => {
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    'La Tentación Burger, Grupo San Diego, Fase 7, 41015 Sevilla'
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="contacto" className="py-16 sm:py-24 bg-transparent relative min-h-[75vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Card 1: Contact Details, Address & Socials (Mobile: second, Desktop: left) */}
          <div className="order-2 lg:order-1 embossed-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white embossed-text-3d mb-3">
                CONTACTO Y LOCALIZACIÓN
              </h1>
              <div className="text-xs font-bold uppercase tracking-wider text-red-500 mb-1 font-mono">
                Restaurante
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase mb-3 embossed-text-3d">
                {RESTAURANT_INFO.name}
              </h2>
              <div className="text-sm text-zinc-200">
                <p className="text-xs text-zinc-400 font-medium italic mb-1">
                  &ldquo;{RESTAURANT_INFO.slogan}&rdquo;
                </p>
                <span className="font-semibold block">{RESTAURANT_INFO.address.street}</span>
                <span className="text-zinc-400">{RESTAURANT_INFO.address.city}, {RESTAURANT_INFO.address.postalCode} (España)</span>
              </div>
            </div>

            {/* Embedded Google Map (verified address, no invented coordinates) */}
            <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.85)] bg-[#0c0c12]">
              <iframe
                title="Mapa de ubicación de La Tentación Burger en Barriada de San Diego, Sevilla"
                src={googleMapsEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Direct Call Action */}
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={`tel:${RESTAURANT_INFO.phone.international}`}
                className="embossed-btn-red inline-flex items-center gap-2 px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wider rounded-xl font-mono"
              >
                <Phone className="w-4 h-4" />
                <span>Llamar: {RESTAURANT_INFO.phone.display}</span>
              </a>
            </div>

            {/* Official Social Media Channels */}
            <div className="pt-6 border-t border-[#1f1f2c]">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                Redes Sociales Oficiales
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={RESTAURANT_INFO.social.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 bg-[#171722] hover:bg-[#202030] rounded-xl border border-[#28283a] transition-colors group"
                >
                  <Instagram className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Instagram</div>
                    <div className="text-xs font-semibold text-white">
                      {RESTAURANT_INFO.social.instagram.handle}
                    </div>
                  </div>
                </a>

                <a
                  href={RESTAURANT_INFO.social.tiktok.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 bg-[#171722] hover:bg-[#202030] rounded-xl border border-[#28283a] transition-colors group"
                >
                  <div className="w-5 h-5 flex items-center justify-center font-bold text-xs text-red-500 group-hover:scale-110 transition-transform">
                    TT
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">TikTok</div>
                    <div className="text-xs font-semibold text-white">
                      {RESTAURANT_INFO.social.tiktok.handle}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Supplied Opening Hours Schedule (Mobile: first, Desktop: right) */}
          <div className="order-1 lg:order-2 embossed-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#1f1f2c] mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                <h2 className="font-display text-xl font-bold uppercase text-white">
                  Horarios de Apertura
                </h2>
              </div>
            </div>

            <div className="divide-y divide-[#1d1d28]">
              {RESTAURANT_INFO.schedule.map((slot) => (
                <div
                  key={slot.day}
                  className="py-3 flex items-center justify-between text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{slot.day}</span>
                    {slot.note && (
                      <span className="text-[10px] text-zinc-400 italic">
                        ({slot.note})
                      </span>
                    )}
                  </div>
                  <span className={`font-mono ${slot.shifts === 'Consultar' ? 'text-amber-400 font-semibold' : 'text-zinc-300'}`}>
                    {slot.shifts}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-[#171722] border border-[#262638] text-xs text-zinc-400 leading-relaxed space-y-1.5">
              <div>
                <strong className="text-zinc-200">Lunes:</strong> Horario no suministrado por el establecimiento; por favor consultar directamente antes de acudir.
              </div>
              <div>
                <strong className="text-zinc-200">Servicio y reservas:</strong> Agradecemos puntualidad en las reservas de mesa y en la recogida de encargos.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
