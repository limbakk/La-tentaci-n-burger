import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Phone } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantInfo';

export type NavView = 'inicio' | 'menu' | 'reservas' | 'delivery' | 'galeria' | 'contacto';

interface NavbarProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  cartItemCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  cartItemCount,
  onOpenCart,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const navLinks: { label: string; view: NavView; href: string }[] = [
    { label: 'Inicio', view: 'inicio', href: '#inicio' },
    { label: 'Menú', view: 'menu', href: '#menu' },
    { label: 'Reservas', view: 'reservas', href: '#reservas' },
    { label: 'Pedidos a domicilio', view: 'delivery', href: '#pedidos-a-domicilio' },
    { label: 'Galería', view: 'galeria', href: '#galeria' },
    { label: 'Contacto', view: 'contacto', href: '#contacto' },
  ];

  const handleLinkClick = (view: NavView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Sticky Header (rendered on non-home views: Menú, Reservas, Delivery, Contacto) */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-[#20202c] shadow-[0_4px_25px_rgba(229,9,20,0.06)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark with 4 stars */}
          <button
            onClick={() => handleLinkClick('inicio')}
            className="group flex flex-col items-start shrink-0 text-left cursor-pointer"
          >
            <div className="flex items-center gap-1 text-[10px] text-red-600 tracking-widest pl-0.5" aria-hidden="true">
              <span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-red-500 transition-colors uppercase leading-none">
              La Tentación <span className="text-red-600">Burger</span>
            </span>
            <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-medium mt-0.5 group-hover:text-zinc-300 transition-colors">
              {RESTAURANT_INFO.slogan}
            </span>
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-300">
            {navLinks.map((link) => {
              const isActive = activeView === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => handleLinkClick(link.view)}
                  className={`transition-colors whitespace-nowrap shrink-0 py-1.5 border-b-2 font-medium cursor-pointer ${
                    isActive
                      ? 'text-white border-red-600'
                      : 'text-zinc-400 hover:text-white border-transparent hover:border-zinc-700'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (Cart + CTA) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenCart}
              aria-label={`Ver pedido de recogida, ${cartItemCount} productos`}
              className="relative p-2.5 rounded-lg bg-[#161622] hover:bg-[#202030] text-zinc-200 border border-[#2c2c3e] hover:border-red-600/40 hover:shadow-[0_0_16px_rgba(229,9,20,0.2)] transition-all flex items-center gap-2 group cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-red-500 group-hover:scale-105 transition-transform" />
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Mi Pedido
              </span>
              {cartItemCount > 0 && (
                <span className="w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center font-mono">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleLinkClick('menu')}
              className="embossed-btn-red hidden sm:inline-flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-lg cursor-pointer transition-transform"
            >
              Ver Menú
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              className="lg:hidden p-2 rounded-lg bg-[#161622] border border-[#2c2c3e] hover:border-red-600/40 hover:shadow-[0_0_16px_rgba(229,9,20,0.2)] text-zinc-300 hover:text-white cursor-pointer transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#0d0d12] border-l border-[#222230] p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#1c1c26]">
                <div className="flex flex-col">
                  <span className="font-display text-xl font-bold text-white uppercase">
                    La Tentación
                  </span>
                  <span className="text-[10px] tracking-widest text-red-500 uppercase font-bold">
                    Sevilla
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="p-2 rounded-lg bg-[#161622] text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-2 mt-6">
                {navLinks.map((link) => {
                  const isActive = activeView === link.view;
                  return (
                    <button
                      key={link.view}
                      onClick={() => handleLinkClick(link.view)}
                      className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-zinc-300 hover:bg-[#181824]'
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#1c1c26] space-y-3">
              <a
                href={`tel:${RESTAURANT_INFO.phone.international}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#161622] hover:bg-[#202030] text-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#2a2a3a]"
              >
                <Phone className="w-3.5 h-3.5 text-red-500" />
                <span>Llamar: {RESTAURANT_INFO.phone.display}</span>
              </a>

              <p className="text-[10px] text-center text-zinc-400">
                {RESTAURANT_INFO.address.street} · Sevilla
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
