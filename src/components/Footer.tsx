import React from 'react';
import { Phone, MapPin, Instagram, ShieldAlert, Heart } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantInfo';

import type { LegalTab } from './LegalModal';

interface FooterProps {
  onOpenLegal?: (tab: LegalTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="bg-[#07070a] border-t border-[#1e1e2b] text-zinc-400 text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#1c1c28]">
          {/* Col 1: Brand & Identity */}
          <div className="md:col-span-1 space-y-3">
            <span className="font-display text-2xl font-bold uppercase tracking-tight text-white block">
              La Tentación <span className="text-red-600">Burger</span>
            </span>
            <p className="text-zinc-400 leading-relaxed text-xs">
              &ldquo;{RESTAURANT_INFO.slogan}&rdquo;
            </p>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Hamburguesas smashed gourmet, baguettes artesanas y el auténtico sabor de Sevilla en Barriada de San Diego.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Secciones
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="hover:text-red-400 transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#carta" className="hover:text-red-400 transition-colors">
                  Carta Completa
                </a>
              </li>
              <li>
                <a href="#fuera-de-carta" className="hover:text-red-400 transition-colors">
                  Fuera de Carta
                </a>
              </li>
              <li>
                <a href="#menu-del-dia" className="hover:text-red-400 transition-colors">
                  Menú del Día
                </a>
              </li>
              <li>
                <a href="#promociones" className="hover:text-red-400 transition-colors">
                  Promociones & Reto
                </a>
              </li>
              <li>
                <a href="#reservas" className="hover:text-red-400 transition-colors">
                  Reservar Mesa
                </a>
              </li>
              <li>
                <a href="#galeria" className="hover:text-red-400 transition-colors">
                  Galería
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Hours */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Contacto y Local
            </div>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{RESTAURANT_INFO.address.full}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <a
                  href={`tel:${RESTAURANT_INFO.phone.international}`}
                  className="font-mono text-zinc-300 hover:text-white"
                >
                  {RESTAURANT_INFO.phone.display}
                </a>
              </li>
              <li className="pt-1 text-[11px] text-zinc-400 space-y-0.5">
                <div>L: Consultar</div>
                <div>M: 20:30 - 23:30</div>
                <div>X-J: 13:30 - 16:00 | 20:30 - 23:30</div>
                <div>V-D: 13:30 - 16:30 | 20:30 - 00:00</div>
              </li>
            </ul>
          </div>

          {/* Col 4: Redes & Social */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Redes Sociales
            </div>
            <div className="space-y-2">
              <a
                href={RESTAURANT_INFO.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-red-400 transition-colors"
              >
                <Instagram className="w-4 h-4 text-red-500" />
                <span>{RESTAURANT_INFO.social.instagram.handle}</span>
              </a>
              <a
                href={RESTAURANT_INFO.social.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-red-400 transition-colors"
              >
                <span className="w-4 h-4 text-xs font-bold text-red-500 flex items-center justify-center">
                  TT
                </span>
                <span>{RESTAURANT_INFO.social.tiktok.handle}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Legal Compliance Navigation Bar (LSSI-CE, RGPD, Cookies, Consumo) */}
        <div className="py-6 border-b border-[#1c1c28] flex flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <button
              type="button"
              onClick={() => onOpenLegal?.('aviso-legal')}
              className="hover:text-red-400 transition-colors cursor-pointer"
            >
              Aviso Legal (LSSI-CE)
            </button>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => onOpenLegal?.('privacidad')}
              className="hover:text-red-400 transition-colors cursor-pointer"
            >
              Política de Privacidad (RGPD)
            </button>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => onOpenLegal?.('cookies')}
              className="hover:text-red-400 transition-colors cursor-pointer"
            >
              Política de Cookies
            </button>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => onOpenLegal?.('consumo')}
              className="hover:text-red-400 transition-colors cursor-pointer"
            >
              Condiciones de Contratación y Consumo
            </button>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono">
            Hostelería y Restauración · Sevilla
          </div>
        </div>

        {/* Commercial Demo Disclaimer Banner (Mandatory Requirement) */}
        <div className="mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400 bg-[#0f0f16] border border-[#20202e] p-4 rounded-xl">
          <div className="flex items-center gap-2 text-zinc-300 text-center md:text-left">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Aviso de confidencialidad comercial:</strong> Esta es una demo comercial privada creada por <strong>{RESTAURANT_INFO.disclaimer.creator}</strong>. No publicar ni desplegar como sitio web oficial.
            </span>
          </div>
          <div className="shrink-0 text-zinc-400 font-mono">
            Sevilla · {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
};
