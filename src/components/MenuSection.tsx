import React, { useState, useMemo } from 'react';
import { Search, Filter, Bike } from 'lucide-react';
import type { MenuCategoryKey, MenuItem, CartItem } from '../types/restaurant';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menu';
import { RESTAURANT_INFO } from '../data/restaurantInfo';
import { ProductCard } from './ProductCard';

interface MenuSectionProps {
  cartItems?: CartItem[];
  onCustomize: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  onDecrementItem?: (item: MenuItem) => void;
  onNavigateToDelivery?: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  cartItems = [],
  onCustomize,
  onQuickAdd,
  onDecrementItem,
  onNavigateToDelivery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategoryKey | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Derive per-product cart quantities and customized unit counts directly from cartItems
  const cartSummaryByItemId = useMemo(() => {
    const map: Record<string, { quantity: number; customizedCount: number }> = {};
    for (const line of cartItems) {
      const id = line.menuItem.id;
      if (!map[id]) {
        map[id] = { quantity: 0, customizedCount: 0 };
      }
      map[id].quantity += line.quantity;
      const isCustomized =
        line.customization.removedIngredients.length > 0 ||
        line.customization.selectedExtras.length > 0 ||
        Boolean(line.customization.isGlutenFreeBread) ||
        Boolean(line.customization.isBeyondSubstitution) ||
        Boolean(line.customization.specialInstructions);
      if (isCustomized) {
        map[id].customizedCount += line.quantity;
      }
    }
    return map;
  }, [cartItems]);

  // Daily Menu burger configurable through central configuration or existing product data
  const configuredProductBurger = MENU_ITEMS.find((item) => item.isDailyBurger);
  const dailyBurgerText =
    RESTAURANT_INFO.dailyMenu.burgerOfTheDay &&
    RESTAURANT_INFO.dailyMenu.burgerOfTheDay.trim() !== ''
      ? RESTAURANT_INFO.dailyMenu.burgerOfTheDay.trim()
      : configuredProductBurger
        ? configuredProductBurger.name
        : RESTAURANT_INFO.dailyMenu.defaultFallbackText;

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'menu-del-dia') {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'todos' || item.category === selectedCategory;
      const matchesSearch =
        query === '' ||
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.ingredients.some((i) => i.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const pickupWhatsAppUrl = `https://wa.me/${RESTAURANT_INFO.phone.clean.startsWith('34') ? RESTAURANT_INFO.phone.clean : `34${RESTAURANT_INFO.phone.clean}`}?text=${encodeURIComponent(
    'Hola, quiero hacer un pedido para recoger en el local'
  )}`;

  const handleDeliveryShortcut = () => {
    if (onNavigateToDelivery) {
      onNavigateToDelivery();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#pedidos-a-domicilio';
    }
  };

  return (
    <section id="carta" className="pt-8 pb-14 sm:pt-10 sm:pb-20 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* First pickup card with title "Menú" immediately above "¡Pide online y recoge en el local!" */}
        <div className="max-w-3xl mx-auto mb-6 px-5 py-4 rounded-2xl embossed-card flex flex-col items-center text-center gap-3">
          <h1 className="font-display text-4xl sm:text-6xl font-bold uppercase tracking-tight text-white embossed-text-3d leading-none">
            Menú
          </h1>
          {selectedCategory !== 'menu-del-dia' && (
            <div className="w-full pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:items-start text-center sm:text-left">
                <span className="font-display text-base sm:text-lg font-bold uppercase tracking-wide text-white">
                  ¡Pide online y recoge en el local!
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 shrink-0">
                <a
                  href={pickupWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="embossed-btn-red px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white cursor-pointer shrink-0 inline-flex items-center justify-center"
                >
                  PEDIR PARA RECOGER
                </a>
                <button
                  type="button"
                  onClick={handleDeliveryShortcut}
                  aria-label="Ir a pedidos a domicilio"
                  title="Pedidos a domicilio (Uber Eats, Glovo y Just Eat)"
                  data-testid="menu-delivery-shortcut-btn"
                  className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold text-xs shadow-md border border-amber-300/80 transition-all cursor-pointer shrink-0"
                >
                  <Bike className="w-4 h-4 stroke-[2.25]" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filter Controls Bar:
            - Mobile: Category bar first (order-1), Search below (order-2)
            - Desktop (md+): Search above category bar (md:order-1), Category bar below (md:order-2)
        */}
        <div className="mb-8 flex flex-col gap-4">
          {/* Horizontal Category Carousel with Menú normal, Menú del día, Fuera de carta and sub-categories */}
          <div className="order-1 md:order-2 flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-1 scrollbar-none touch-pan-x">
            {/* Tab 1: Menú normal (Todos) */}
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCategory === 'todos'
                  ? 'bg-red-600 text-white shadow-md border border-red-500'
                  : 'bg-[#101017] text-zinc-400 hover:text-white hover:bg-[#181822] border border-white/10'
              }`}
            >
              MENÚ NORMAL ({MENU_ITEMS.length})
            </button>

            {/* Tab 2: MENÚ DEL DÍA */}
            <button
              onClick={() => setSelectedCategory('menu-del-dia')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCategory === 'menu-del-dia'
                  ? 'bg-red-600 text-white shadow-md border border-red-500'
                  : 'bg-[#101017] text-zinc-400 hover:text-white hover:bg-[#181822] border border-white/10'
              }`}
            >
              MENÚ DEL DÍA
            </button>

            {/* Tab 3: HAMBURGUESAS (11) and all other existing categories in their current order */}
            {MENU_CATEGORIES.map((cat) => {
              const count = MENU_ITEMS.filter((i) => i.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-red-600 text-white shadow-md border border-red-500'
                      : 'bg-[#101017] text-zinc-400 hover:text-white hover:bg-[#181822] border border-white/10'
                  }`}
                >
                  {cat.name.toUpperCase()} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box: below categories on mobile (order-2), above categories on desktop (md:order-1) */}
          <div className="order-2 md:order-1 relative w-full md:max-w-md md:mx-auto">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por plato o ingrediente..."
              aria-label="Buscar por plato o ingrediente"
              className="w-full pl-10 pr-4 py-2.5 bg-[#101017] border border-white/15 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>

        {/* Menú del Día Dedicated View */}
        {selectedCategory === 'menu-del-dia' ? (
          <div className="max-w-2xl mx-auto embossed-card rounded-2xl p-6 sm:p-8 text-center space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-zinc-800/90 border border-white/15 text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider">
              Horario: {RESTAURANT_INFO.dailyMenu.availabilityHours}
            </span>
            <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase text-white embossed-text-3d">
              Menú del Día
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-lg mx-auto">
              {dailyBurgerText}
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const summary = cartSummaryByItemId[item.id];
              return (
                <ProductCard
                  key={item.id}
                  item={item}
                  cartQuantity={summary?.quantity ?? 0}
                  customizedCount={summary?.customizedCount ?? 0}
                  onCustomize={onCustomize}
                  onQuickAdd={onQuickAdd}
                  onDecrementItem={onDecrementItem}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#0d0d12] border border-[#22222e] rounded-2xl p-8">
            <Filter className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-200 mb-1">
              No se han encontrado platos con ese criterio
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Prueba a cambiar de categoría o a buscar otro ingrediente.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg cursor-pointer"
            >
              Ver todos los platos
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

