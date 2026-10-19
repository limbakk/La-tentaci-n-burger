import type { CartItem, MenuExtra, CustomerOrderDetails, ReservationRequest } from '../types/restaurant';

export const BEYOND_SUBSTITUTION_PRICE = 1.0;

/**
 * Formats a number to Spanish Euro currency string, e.g. 12.5 -> "12,50 €"
 */
export function formatEuros(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const parts = rounded.toFixed(2).split('.');
  return `${parts[0]},${parts[1]} €`;
}

/**
 * Calculates subtotal for a single customized item line
 */
export function calculateLinePrice(
  basePrice: number,
  extras: MenuExtra[],
  quantity: number,
  isBeyondSubstitution: boolean = false
): number {
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0);
  const beyondSupplement = isBeyondSubstitution ? BEYOND_SUBSTITUTION_PRICE : 0;
  const singleItemTotal = Math.round((basePrice + extrasTotal + beyondSupplement) * 100) / 100;
  return Math.round(singleItemTotal * quantity * 100) / 100;
}

/**
 * Calculates overall cart totals
 */
export function calculateCartSummary(items: CartItem[]): {
  subtotal: number;
  total: number;
  totalQuantity: number;
} {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.itemSubtotal, 0);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  return {
    subtotal: roundedSubtotal,
    total: roundedSubtotal,
    totalQuantity,
  };
}

/**
 * Removes exactly 1 unit of the given product ID from the cart,
 * preserving its customizations and updating line/cart totals accurately.
 * Safely handles missing items and prevents negative quantities.
 */
export function decrementProductInCart(
  items: CartItem[],
  menuItemId: string
): CartItem[] {
  if (!Array.isArray(items) || items.length === 0 || !menuItemId) {
    return items;
  }

  // Find the most recently added cart line for this dish with positive quantity
  let targetIndex = -1;
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].menuItem.id === menuItemId && items[i].quantity > 0) {
      targetIndex = i;
      break;
    }
  }

  if (targetIndex === -1) {
    return items;
  }

  const targetLine = items[targetIndex];
  const nextQuantity = targetLine.quantity - 1;

  if (nextQuantity <= 0) {
    return items.filter((_, idx) => idx !== targetIndex);
  }

  const updatedSubtotal = calculateLinePrice(
    targetLine.menuItem.price,
    targetLine.customization.selectedExtras,
    nextQuantity,
    targetLine.customization.isBeyondSubstitution
  );

  return items.map((line, idx) =>
    idx === targetIndex
      ? {
          ...line,
          quantity: nextQuantity,
          itemSubtotal: updatedSubtotal,
        }
      : line
  );
}

export const CART_STORAGE_KEY = 'la_tentacion_cart_v1';

/**
 * Serializes cart items for localStorage persistence
 */
export function serializeCartItems(items: CartItem[]): string {
  return JSON.stringify(items);
}

/**
 * Restores and validates persisted cart items from JSON string,
 * recalculating line subtotals so prices and totals remain accurate.
 */
export function restoreCartItems(raw: string | null | undefined): CartItem[] {
  if (!raw || typeof raw !== 'string') {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const validItems: CartItem[] = [];
    for (const entry of parsed) {
      if (
        !entry ||
        typeof entry !== 'object' ||
        !entry.menuItem ||
        typeof entry.menuItem.id !== 'string' ||
        typeof entry.menuItem.name !== 'string' ||
        typeof entry.menuItem.price !== 'number' ||
        typeof entry.quantity !== 'number' ||
        entry.quantity <= 0
      ) {
        continue;
      }

      const quantity = Math.floor(entry.quantity);
      if (quantity <= 0) continue;

      const rawCust = entry.customization && typeof entry.customization === 'object' ? entry.customization : {};
      const removedIngredients = Array.isArray(rawCust.removedIngredients)
        ? rawCust.removedIngredients.filter((i: unknown) => typeof i === 'string')
        : [];
      const selectedExtras: MenuExtra[] = Array.isArray(rawCust.selectedExtras)
        ? rawCust.selectedExtras.filter(
            (e: unknown): e is MenuExtra =>
              Boolean(
                e &&
                  typeof e === 'object' &&
                  typeof (e as MenuExtra).id === 'string' &&
                  typeof (e as MenuExtra).name === 'string' &&
                  typeof (e as MenuExtra).price === 'number'
              )
          )
        : [];
      const isBeyondSubstitution = Boolean(rawCust.isBeyondSubstitution);
      const isGlutenFreeBread = Boolean(rawCust.isGlutenFreeBread);
      const selectedChoice =
        typeof rawCust.selectedChoice === 'string' && rawCust.selectedChoice.trim() !== ''
          ? rawCust.selectedChoice
          : undefined;
      const specialInstructions =
        typeof rawCust.specialInstructions === 'string' && rawCust.specialInstructions.trim() !== ''
          ? rawCust.specialInstructions
          : undefined;

      const recalculatedSubtotal = calculateLinePrice(
        entry.menuItem.price,
        selectedExtras,
        quantity,
        isBeyondSubstitution
      );

      validItems.push({
        cartLineId:
          typeof entry.cartLineId === 'string' && entry.cartLineId.trim() !== ''
            ? entry.cartLineId
            : `${entry.menuItem.id}-${ validItems.length + 1 }`,
        menuItem: entry.menuItem,
        quantity,
        customization: {
          removedIngredients,
          selectedExtras,
          isBeyondSubstitution,
          isGlutenFreeBread,
          selectedChoice,
          specialInstructions,
        },
        itemSubtotal: recalculatedSubtotal,
      });
    }
    return validItems;
  } catch {
    return [];
  }
}

/**
 * Builds clean, structured WhatsApp message for Pickup order
 */
export function buildWhatsAppOrderMessage(
  items: CartItem[],
  customer: CustomerOrderDetails
): string {
  const { total, totalQuantity } = calculateCartSummary(items);

  let message = `Hola, quiero hacer un pedido para recoger en el local\n\n`;
  message += `*NUEVO PEDIDO PARA RECOGER - LA TENTACIÓN BURGER*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `*Cliente:* ${customer.name}\n`;
  message += `*Teléfono:* ${customer.phone}\n`;
  message += `*Hora estimada de recogida:* ${customer.pickupTime}\n`;
  if (customer.orderNotes && customer.orderNotes.trim() !== '') {
    message += `*Notas para cocina:* ${customer.orderNotes.trim()}\n`;
  }
  message += `\n*DETALLE DEL PEDIDO (${totalQuantity} ${totalQuantity === 1 ? 'producto' : 'productos'}):*\n`;

  items.forEach((item, index) => {
    message += `\n${index + 1}. *${item.quantity}x ${item.menuItem.name}* - ${formatEuros(item.itemSubtotal)}`;

    if (item.customization.selectedChoice) {
      message += `\n   ↳ 🔹 Opción: ${item.customization.selectedChoice}`;
    }
    if (item.customization.isBeyondSubstitution) {
      message += `\n   ↳ 🌱 Sustitución Beyond (+${formatEuros(BEYOND_SUBSTITUTION_PRICE)})`;
    }
    if (item.customization.isGlutenFreeBread) {
      message += `\n   ↳ 🌾 Pan sin gluten (0,00 €)`;
    }
    if (item.customization.removedIngredients.length > 0) {
      message += `\n   ↳ ❌ Sin: ${item.customization.removedIngredients.join(', ')}`;
    }
    if (item.customization.selectedExtras.length > 0) {
      const extrasList = item.customization.selectedExtras
        .map((e) => `+${e.name} (${formatEuros(e.price)})`)
        .join(', ');
      message += `\n   ↳ ➕ Extras: ${extrasList}`;
    }
    if (item.customization.specialInstructions) {
      message += `\n   ↳ 📝 Nota: ${item.customization.specialInstructions}`;
    }
  });

  message += `\n\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*TOTAL A PAGAR EN LOCAL:* ${formatEuros(total)}\n`;
  message += `*Lugar de recogida:* Barriada de San Diego, Sevilla, 41015\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `_Pedido generado desde la carta web oficial de La Tentación Burger_`;

  return message;
}

/**
 * Builds clean WhatsApp reservation message
 */
export function buildWhatsAppReservationMessage(
  res: ReservationRequest
): string {
  let message = `*SOLICITUD DE RESERVA DE MESA - LA TENTACIÓN BURGER*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `*Nombre:* ${res.name}\n`;
  message += `*Teléfono:* ${res.phone}\n`;
  message += `*Fecha:* ${res.date}\n`;
  message += `*Hora:* ${res.time}\n`;
  message += `*Número de comensales:* ${res.guests} ${res.guests === 1 ? 'persona' : 'personas'}\n`;
  if (res.notes && res.notes.trim() !== '') {
    message += `*Observaciones:* ${res.notes.trim()}\n`;
  }
  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `_A la espera de confirmación de disponibilidad por parte del restaurante._`;
  return message;
}
