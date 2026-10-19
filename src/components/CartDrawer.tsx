import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import type { CartItem, CustomerOrderDetails } from '../types/restaurant';
import { formatEuros, calculateCartSummary, buildWhatsAppOrderMessage } from '../utils/pricing';
import { RESTAURANT_INFO } from '../data/restaurantInfo';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartLineId: string, delta: number) => void;
  onRemoveItem: (cartLineId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('21:30');
  const [orderNotes, setOrderNotes] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const { subtotal, total, totalQuantity } = calculateCartSummary(items);

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg('Tu cesta está vacía.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Indica tu nombre para el pedido.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMsg('Indica un teléfono de contacto válido.');
      return;
    }
    if (!privacyAccepted) {
      setErrorMsg('Debes aceptar el tratamiento de datos para tramitar la recogida.');
      return;
    }

    const message = buildWhatsAppOrderMessage(items, {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      pickupTime,
      orderNotes: orderNotes.trim() || undefined,
    });

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/34${RESTAURANT_INFO.phone.clean}?text=${encoded}`;
    onClearCart();
    window.location.href = whatsappUrl;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cesta de la compra"
      className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-[#121218] border-l border-[#262638] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#212130] flex items-center justify-between bg-[#0e0e14]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                Tu Pedido (Recogida)
              </h2>
              <span className="text-[11px] text-zinc-400 block -mt-0.5">
                {totalQuantity} {totalQuantity === 1 ? 'producto' : 'productos'} en cesta
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar pedido"
            className="p-2 text-zinc-400 hover:text-white hover:bg-[#1a1a26] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
              <p className="text-sm font-medium text-zinc-300">Tu cesta está vacía</p>
              <p className="text-xs text-zinc-500 mt-1 mb-6">
                Añade tus hamburguesas o entrantes favoritos de la carta.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Explorar Carta
              </button>
            </div>
          ) : (
            items.map((line) => (
              <div
                key={line.cartLineId}
                className="bg-[#171722] border border-[#262638] rounded-xl p-3.5 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-display text-sm font-bold text-white uppercase leading-snug">
                      {line.menuItem.name}
                    </h3>
                    <span className="text-xs font-mono font-bold text-red-400">
                      {formatEuros(line.itemSubtotal)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(line.cartLineId)}
                    aria-label={`Eliminar ${line.menuItem.name}`}
                    className="text-zinc-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Customizations tags */}
                {(line.customization.removedIngredients.length > 0 ||
                  line.customization.selectedExtras.length > 0 ||
                  line.customization.isGlutenFreeBread ||
                  line.customization.selectedChoice ||
                  line.customization.specialInstructions) && (
                  <div className="text-[11px] text-zinc-300 space-y-1 bg-[#111119] p-2.5 rounded-lg border border-[#20202e]">
                    {line.customization.selectedChoice && (
                      <div className="text-zinc-200 font-medium">
                        🔹 {line.customization.selectedChoice}
                      </div>
                    )}
                    {line.customization.isGlutenFreeBread && (
                      <div className="text-amber-300">
                        🌾 Pan sin gluten (0,00 €)
                      </div>
                    )}
                    {line.customization.removedIngredients.length > 0 && (
                      <div className="text-red-400">
                        ❌ Sin: {line.customization.removedIngredients.join(', ')}
                      </div>
                    )}
                    {line.customization.selectedExtras.length > 0 && (
                      <div className="text-emerald-300">
                        ➕ Extras: {line.customization.selectedExtras.map((e) => `${e.name} (+${formatEuros(e.price)})`).join(', ')}
                      </div>
                    )}
                    {line.customization.specialInstructions && (
                      <div className="text-zinc-400 italic">
                        📝 &ldquo;{line.customization.specialInstructions}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {/* Stepper Quantity (slightly enlarged for mobile touch usability) */}
                <div className="flex items-center justify-between pt-2 border-t border-[#202030]">
                  <span className="text-xs text-zinc-400">Cantidad</span>
                  <div className="flex items-center bg-[#101017] border border-[#29293c] rounded-lg">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(line.cartLineId, -1)}
                      aria-label="Disminuir unidad"
                      className="px-2.5 py-2 text-zinc-300 hover:text-white hover:bg-[#1c1c28] rounded-l-lg transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs sm:text-sm font-mono font-bold text-white">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(line.cartLineId, 1)}
                      aria-label="Aumentar unidad"
                      className="px-2.5 py-2 text-zinc-300 hover:text-white hover:bg-[#1c1c28] rounded-r-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Customer Pickup Form (Only shown if cart has items) */}
          {items.length > 0 && (
            <div className="pt-4 border-t border-[#212130] space-y-3.5">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Datos de Recogida en Local
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Tu nombre *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej.: Rafael Guillén"
                  className="w-full px-3 py-2 bg-[#0e0e15] border border-[#272738] rounded-lg text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Teléfono móvil *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Tu teléfono móvil"
                  className="w-full px-3 py-2 bg-[#0e0e15] border border-[#272738] rounded-lg text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Hora estimada de recogida</label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0e0e15] border border-[#272738] rounded-lg text-xs text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Lo antes posible (aprox 20-30 min)">Lo antes posible (20-30 min)</option>
                  <option value="14:00">14:00 (Mediodía)</option>
                  <option value="14:30">14:30 (Mediodía)</option>
                  <option value="15:00">15:00 (Mediodía)</option>
                  <option value="20:30">20:30 (Noche)</option>
                  <option value="21:00">21:00 (Noche)</option>
                  <option value="21:30">21:30 (Noche)</option>
                  <option value="22:00">22:00 (Noche)</option>
                  <option value="22:30">22:30 (Noche)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Notas adicionales</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Instrucciones para empaquetado o salsas..."
                  className="w-full px-3 py-2 bg-[#0e0e15] border border-[#272738] rounded-lg text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>

              {/* GDPR First-Layer Notice & Consent Checkbox */}
              <div className="pt-2 border-t border-white/5 space-y-1.5 text-[11px] text-zinc-400">
                <label className="flex items-start gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-[#2b2b3d] text-red-600 focus:ring-red-600 shrink-0"
                  />
                  <span>
                    Acepto el tratamiento de mis datos de contacto para la preparación y recogida de mi pedido conforme a la Política de Privacidad. *
                  </span>
                </label>
                <div className="text-[10px] text-zinc-500 pl-5">
                  Responsable: La Tentación Burger. Finalidad: Gestión del encargo en cocina. Base: Medidas precontractuales.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#212130] bg-[#0e0e14] space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400 font-medium">Total a pagar en local:</span>
              <span className="font-mono text-xl font-bold text-white">
                {formatEuros(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSendWhatsAppOrder}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enviar Pedido por WhatsApp</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Recogida: Barriada de San Diego, Sevilla</span>
              <button
                type="button"
                onClick={onClearCart}
                className="hover:text-red-400 transition-colors"
              >
                Vaciar cesta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
