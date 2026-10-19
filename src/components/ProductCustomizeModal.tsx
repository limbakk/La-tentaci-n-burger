import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Minus } from 'lucide-react';
import type { MenuItem, MenuExtra, CartCustomization } from '../types/restaurant';
import { AVAILABLE_EXTRAS, EXTRA_GROUPS } from '../data/menu';
import { formatEuros, calculateLinePrice } from '../utils/pricing';

interface ProductCustomizeModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    customization: CartCustomization,
    quantity: number,
    totalPrice: number
  ) => void;
}

export const ProductCustomizeModal: React.FC<ProductCustomizeModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<MenuExtra[]>([]);
  const [isGlutenFreeBread, setIsGlutenFreeBread] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && item) {
      setQuantity(1);
      setRemovedIngredients([]);
      setSelectedExtras([]);
      setIsGlutenFreeBread(false);
      setSelectedChoice(item.requiredChoice?.defaultOption || item.requiredChoice?.options[0] || '');
      setSpecialInstructions('');
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const toggleRemoveIngredient = (ing: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const toggleExtra = (extra: MenuExtra) => {
    setSelectedExtras((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const currentLinePrice = calculateLinePrice(
    item.price,
    selectedExtras,
    quantity,
    false
  );

  const handleConfirm = () => {
    onAddToCart(
      item,
      {
        removedIngredients,
        selectedExtras,
        isGlutenFreeBread: item.allowsGlutenFreeBread ? isGlutenFreeBread : false,
        selectedChoice: item.requiredChoice ? selectedChoice : undefined,
        specialInstructions: specialInstructions.trim() || undefined,
      },
      quantity,
      currentLinePrice
    );
    onClose();
  };

  // Filter extras by applicable groups for this specific product
  const applicableGroups = EXTRA_GROUPS.filter((group) =>
    item.applicableExtraGroups?.includes(group.id)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customize-title"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start sm:items-center justify-center px-3 py-2 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl"
      >
        {/* Discreet corner Close (X) button accessible without occupying header space */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar personalización"
          className="absolute top-0.5 right-1 z-20 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white bg-[#14141d]/90 hover:bg-[#1f1f2d] border border-[#272738] rounded-full transition-colors cursor-pointer shrink-0 shadow-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Unified Scroll Container so the Dish Name above the options box scrolls away naturally */}
        <div
          data-testid="customize-scroll-container"
          className="w-full max-h-[95vh] overflow-y-auto overscroll-contain touch-pan-y"
        >
          {/* Dish Name outside the options box, directly above it, in larger text */}
          <h2
            id="customize-title"
            className="font-display text-3xl sm:text-5xl font-bold text-white uppercase tracking-tight embossed-text-3d leading-none mb-2 px-1 pr-10"
          >
            {item.name}
          </h2>

          {/* Options Box */}
          <div className="w-full bg-[#14141d] border border-[#272738] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Options Content */}
          <div className="p-4 sm:p-6 space-y-5 text-sm">
            {/* Section: Required Choice (e.g. sauce or drink) */}
            {item.requiredChoice && (
              <div className="bg-[#181824] border border-[#2b2b3d] p-4 rounded-xl">
                <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">
                  {item.requiredChoice.label} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {item.requiredChoice.options.map((option) => {
                    const isSelected = selectedChoice === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedChoice(option)}
                        className={`px-3 py-2.5 rounded-lg border text-xs font-semibold text-left transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-red-600 border-red-600 text-white shadow-sm'
                            : 'bg-[#12121a] border-[#29293c] text-zinc-300 hover:text-white hover:bg-[#1a1a26]'
                        }`}
                      >
                        <span>{option}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section: Gluten-free bread option (0,00 €) */}
            {item.allowsGlutenFreeBread && (
              <div className="bg-[#161622] border border-[#2b2b3d] p-3.5 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 block">
                    Opción Pan Sin Gluten
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Disponible para esta hamburguesa sin ningún suplemento añadido (0,00 €).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGlutenFreeBread(!isGlutenFreeBread)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors shrink-0 ${
                    isGlutenFreeBread
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-[#111118] border-[#2e2e40] text-zinc-400 hover:text-white'
                  }`}
                >
                  {isGlutenFreeBread ? 'Pan sin gluten ✓' : 'Pedir sin gluten'}
                </button>
              </div>
            )}

            {/* Section: Removable Ingredients */}
            {item.removableIngredients && item.removableIngredients.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Quitar ingredientes incluidos
                  </h3>
                  <span className="text-[11px] text-zinc-400">Sin coste adicional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.removableIngredients.map((ing) => {
                    const isRemoved = removedIngredients.includes(ing);
                    return (
                      <button
                        key={ing}
                        type="button"
                        onClick={() => toggleRemoveIngredient(ing)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-colors ${
                          isRemoved
                            ? 'bg-red-950/30 border-red-700/60 text-red-300'
                            : 'bg-[#181822] border-[#29293a] text-zinc-300 hover:bg-[#20202d]'
                        }`}
                      >
                        <span className="text-xs">{ing}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            isRemoved
                              ? 'bg-red-900/60 text-red-200'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {isRemoved ? '❌ Quitar' : '✓ Incluido'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section: Categorized Paid Extras */}
            {applicableGroups.length > 0 && (
              <div className="space-y-5 pt-2 border-t border-[#232332]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Suplementos y Extras de Pago
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Precios unitarios claramente indicados. Los extras seleccionados se añaden al precio del producto.
                  </p>
                </div>

                {applicableGroups.map((group) => {
                  const groupExtras = AVAILABLE_EXTRAS.filter((e) => e.group === group.id);
                  return (
                    <div key={group.id} className="bg-[#101017] border border-[#232332] p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                          {group.name}
                        </span>
                        <span className="text-xs font-mono font-semibold text-zinc-400">
                          {group.priceText}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {groupExtras.map((extra) => {
                          const isSelected = selectedExtras.some((e) => e.id === extra.id);
                          return (
                            <button
                              key={extra.id}
                              type="button"
                              onClick={() => toggleExtra(extra)}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors ${
                                isSelected
                                  ? 'bg-red-950/30 border-red-600 text-white'
                                  : 'bg-[#161622] border-[#272738] text-zinc-300 hover:bg-[#1d1d2b]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                                    isSelected
                                      ? 'bg-red-600 border-red-600 text-white'
                                      : 'border-zinc-600 bg-transparent'
                                  }`}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span>{extra.name}</span>
                              </div>
                              <span className="font-mono text-xs font-semibold text-red-400">
                                +{formatEuros(extra.price)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Section: Kitchen Notes */}
            <div>
              <label
                htmlFor="special-instructions"
                className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5"
              >
                Instrucciones especiales para cocina (opcional)
              </label>
              <input
                id="special-instructions"
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Ej.: Punto de carne poco hecho, salsa aparte..."
                className="w-full bg-[#101017] border border-[#272738] rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Footer: Stepper & Add Button */}
          <div className="p-4 sm:p-5 border-t border-[#232332] bg-[#101017] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-xs sm:text-sm text-zinc-400 font-medium">Unidades:</span>
              <div className="flex items-center bg-[#1a1a24] border border-[#2c2c3e] rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Reducir unidades"
                  className="px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-[#252535] rounded-l-lg transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3.5 text-sm font-mono font-bold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Aumentar unidades"
                  className="px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-[#252535] rounded-r-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-all"
            >
              <span>Añadir al pedido</span>
              <span className="font-mono text-sm">({formatEuros(currentLinePrice)})</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
