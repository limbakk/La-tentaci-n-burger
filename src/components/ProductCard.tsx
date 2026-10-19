import React, { useState } from 'react';
import { Plus, Settings2, Sparkles, Check } from 'lucide-react';
import type { MenuItem } from '../types/restaurant';
import { formatEuros } from '../utils/pricing';
import { useViewportEntrance } from '../utils/useViewportEntrance';

interface ProductCardProps {
  item: MenuItem;
  cartQuantity?: number;
  customizedCount?: number;
  onCustomize: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  onDecrementItem?: (item: MenuItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  cartQuantity = 0,
  customizedCount = 0,
  onCustomize,
  onQuickAdd,
  onDecrementItem,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const { ref, entranceClassName } = useViewportEntrance<HTMLElement>();
  const isSelectedInCart = cartQuantity > 0;

  const hasOptions =
    item.allowsGlutenFreeBread ||
    item.requiredChoice ||
    (item.removableIngredients && item.removableIngredients.length > 0) ||
    (item.applicableExtraGroups && item.applicableExtraGroups.length > 0);

  const handleAction = () => {
    onQuickAdd(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 900);
  };

  const handleDecrement = () => {
    if (cartQuantity <= 0 || !onDecrementItem) return;
    onDecrementItem(item);
  };

  return (
    <article
      ref={ref}
      className={`group relative overflow-hidden flex flex-col justify-between rounded-xl p-5 sm:p-6 embossed-card ${entranceClassName}`}
      aria-label={`Producto: ${item.name}${isSelectedInCart ? `, seleccionado en tu pedido (${cartQuantity})` : ''}`}
      data-selected={isSelectedInCart ? 'true' : 'false'}
    >
      {/* Subtle internal bottom flame & ember effect when selected in cart (quantity > 0) */}
      {isSelectedInCart && (
        <div
          className="pointer-events-none select-none absolute inset-x-0 bottom-0 h-24 overflow-hidden z-0 rounded-b-xl"
          aria-hidden="true"
          data-testid={`selected-flame-${item.id}`}
        >
          <div className="card-selected-flame-glow" />
          <svg
            viewBox="0 0 320 90"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 w-full h-16 opacity-55"
          >
            <defs>
              <linearGradient id={`card-flame-outer-${item.id}`} x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#991b1b" stopOpacity="0.72" />
                <stop offset="45%" stopColor="#dc2626" stopOpacity="0.42" />
                <stop offset="82%" stopColor="#ea580c" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`card-flame-core-${item.id}`} x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#ea580c" stopOpacity="0.65" />
                <stop offset="55%" stopColor="#fb923c" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 90 L0 72 C22 64, 34 42, 54 58 C72 34, 94 24, 114 52 C134 28, 156 14, 176 48 C196 22, 222 30, 242 56 C264 32, 288 44, 320 68 L320 90 Z"
              fill={`url(#card-flame-outer-${item.id})`}
              className="card-selected-flame-wave"
            />
            <path
              d="M18 90 C44 68, 66 48, 88 66 C112 42, 138 30, 162 60 C186 36, 212 44, 236 66 C260 48, 284 58, 306 90 Z"
              fill={`url(#card-flame-core-${item.id})`}
              className="card-selected-flame-wave card-selected-flame-wave--inner"
            />
          </svg>
          <span className="card-selected-ember left-[16%] bottom-1.5" />
          <span className="card-selected-ember card-selected-ember--delayed left-[38%] bottom-2" />
          <span className="card-selected-ember card-selected-ember--slow left-[62%] bottom-1" />
          <span className="card-selected-ember card-selected-ember--delayed right-[18%] bottom-1.5" />
        </div>
      )}

      {/* Decorative top-left small red diamond motif inspired by original menu */}
      <div className="absolute top-2.5 left-2.5 text-red-600/50 text-[9px] pointer-events-none z-10" aria-hidden="true">
        ◆
      </div>

      <div className="relative z-10">
        {/* Category & Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-2 pl-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">
            {item.category.replace(/-/g, ' ')}
          </span>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {item.isFueraDeCarta && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-200 bg-red-950/80 border border-white/15 px-2 py-0.5 rounded-md shadow-sm">
                <Sparkles className="w-3 h-3 text-red-400" />
                <span>Fuera de Carta</span>
              </span>
            )}
          </div>
        </div>

        {/* Product Title in Handwritten/Chalkboard Menu Font in White */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-script text-2xl sm:text-3xl font-bold tracking-normal text-white embossed-text-3d leading-tight">
            {item.name}
          </h3>

          {/* Original Menu Style Solid Red Price Badge with 3D embossed depth */}
          <div className="embossed-btn-red shrink-0 px-2.5 py-1 text-white font-mono font-bold text-sm sm:text-base rounded-md text-center">
            {formatEuros(item.price)}
          </div>
        </div>

        {/* Description if present */}
        {item.description && (
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-3">
            {item.description}
          </p>
        )}

        {/* Ingredients list in clean, readable font */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="mb-3 pt-2.5 border-t border-white/5">
            <p className="text-xs text-zinc-300 leading-relaxed font-normal">
              {item.ingredients.join(' · ')}
            </p>
          </div>
        )}

        {/* Included sides and options notes */}
        <div className="space-y-1 mb-4 text-[11px]">
          {item.includedSides && (
            <div className="text-red-400 font-medium flex items-center gap-1 font-script text-base">
              <span>🍟</span>
              <span>{item.includedSides}</span>
            </div>
          )}
          {item.requiredChoice && (
            <div className="text-zinc-400 flex items-center gap-1">
              <span className="text-red-500 font-bold">•</span>
              <span>{item.requiredChoice.label}: {item.requiredChoice.options.join(' / ')}</span>
            </div>
          )}
          {item.allowsGlutenFreeBread && (
            <div className="text-zinc-400 flex items-center gap-1 text-[11px]">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Pan sin gluten disponible (sin suplemento)</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions: Personalizar (far left) | Añadir + −1 (centered) | ×N quantity indicator (far right) */}
      <div className="relative z-10 pt-3 border-t border-white/5 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-2.5 mt-auto">
        {/* Far left: Personalizar */}
        <div className="flex items-center justify-start">
          {hasOptions ? (
            <button
              type="button"
              onClick={() => onCustomize(item)}
              aria-label={`Personalizar ${item.name}`}
              className="embossed-btn-dark inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-zinc-200 hover:text-white text-[11px] sm:text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Settings2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Personalizar</span>
            </button>
          ) : null}
        </div>

        {/* Center: Añadir + separate −1 button immediately to its right */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleAction}
            aria-label={isAdded ? `${item.name} añadido al pedido` : `Añadir ${item.name} al pedido por ${formatEuros(item.price)}`}
            className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
              isAdded ? 'bg-emerald-600 border border-emerald-500 scale-105' : 'embossed-btn-red'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span>¡Añadido!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Añadir</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDecrement}
            aria-label={`Quitar 1 unidad de ${item.name}`}
            data-testid={`decrement-btn-${item.id}`}
            className={`embossed-btn-dark inline-flex items-center justify-center min-w-[2.75rem] sm:min-w-[3rem] px-3 sm:px-3.5 py-2 rounded-lg font-mono text-sm sm:text-base font-bold leading-none whitespace-nowrap transition-all ${
              isSelectedInCart
                ? 'text-red-400 hover:text-white hover:border-red-500/60 active:scale-95 cursor-pointer'
                : 'text-zinc-500 opacity-45 cursor-default'
            }`}
          >
            −1
          </button>
        </div>

        {/* Far right: quantity indicator (slightly enlarged for better readability, no pill/box) */}
        <div className="flex items-center justify-end min-h-[2.25rem]">
          {isSelectedInCart && (
            <span
              data-testid={`selected-indicator-${item.id}`}
              aria-label={`Cantidad seleccionada: ${cartQuantity}${customizedCount > 0 ? ` (${customizedCount} personalizado)` : ''}`}
              className="font-script text-3xl sm:text-4xl font-bold text-red-500 leading-none select-none pr-0.5"
            >
              ×{cartQuantity}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
