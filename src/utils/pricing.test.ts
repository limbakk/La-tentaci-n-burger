import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatEuros,
  calculateLinePrice,
  calculateCartSummary,
  decrementProductInCart,
  serializeCartItems,
  restoreCartItems,
  buildWhatsAppOrderMessage,
  buildWhatsAppReservationMessage,
  BEYOND_SUBSTITUTION_PRICE,
} from './pricing.ts';
import type { CartItem, MenuExtra, MenuItem } from '../types/restaurant.ts';

test('formatEuros formats numbers correctly with comma and euro sign', () => {
  assert.equal(formatEuros(12.5), '12,50 €');
  assert.equal(formatEuros(10.9), '10,90 €');
  assert.equal(formatEuros(1.0), '1,00 €');
  assert.equal(formatEuros(0), '0,00 €');
  assert.equal(formatEuros(15.9), '15,90 €');
});

test('calculateLinePrice computes base price plus extras and beyond substitution multiplied by quantity', () => {
  const extras: MenuExtra[] = [
    { id: 'bacon', name: 'Bacon', price: 1.0, group: 'other' },
    { id: 'cheddar', name: 'Cheddar', price: 1.5, group: 'cheeses' },
  ];
  // Base 10.90 + 1.00 (bacon) + 1.50 (cheddar) + 1.00 (beyond) = 14.40 * 2 = 28.80
  const total = calculateLinePrice(10.9, extras, 2, true);
  assert.equal(total, 28.8);

  // Without beyond: 10.90 + 2.50 = 13.40 * 1 = 13.40
  const totalWithoutBeyond = calculateLinePrice(10.9, extras, 1, false);
  assert.equal(totalWithoutBeyond, 13.4);
});

test('calculateCartSummary aggregates quantity and totals correctly', () => {
  const dummyBurger: MenuItem = {
    id: 'la-clasica',
    name: 'La Clásica',
    ingredients: ['Dos carnes smash premium', 'Queso cheddar', 'Lechuga', 'Tomate', 'Mayomost'],
    removableIngredients: ['Queso cheddar', 'Lechuga', 'Tomate', 'Mayomost'],
    price: 10.9,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
  };

  const cartItems: CartItem[] = [
    {
      cartLineId: 'line-1',
      menuItem: dummyBurger,
      quantity: 1,
      customization: {
        removedIngredients: ['Tomate'],
        selectedExtras: [],
        isBeyondSubstitution: true,
      },
      itemSubtotal: 11.9,
    },
    {
      cartLineId: 'line-2',
      menuItem: {
        id: 'crispy-wings',
        name: 'Crispy Chicken Wings',
        ingredients: ['Siete alitas de pollo empanadas con salsa barbacoa'],
        removableIngredients: [],
        price: 6.5,
        category: 'entrantes',
      },
      quantity: 2,
      customization: {
        removedIngredients: [],
        selectedExtras: [],
      },
      itemSubtotal: 13.0,
    },
  ];

  const summary = calculateCartSummary(cartItems);
  assert.equal(summary.totalQuantity, 3);
  assert.equal(summary.subtotal, 24.9);
  assert.equal(summary.total, 24.9);
});

test('decrementProductInCart removes 1 unit at a time (3 -> 2 -> 1 -> 0), preserves customizations, and safely handles missing items', () => {
  const burger: MenuItem = {
    id: 'la-tentacion',
    name: 'La Tentación',
    ingredients: ['Dos carnes smash premium', 'Queso cheddar'],
    removableIngredients: ['Queso cheddar'],
    price: 12.5,
    category: 'hamburguesas',
  };
  const extraBacon: MenuExtra = { id: 'bacon', name: 'Bacon', price: 1.0, group: 'other' };

  // Start with quantity 3 and customizations (unit price = 12.5 + 1.0 = 13.5, total = 40.5)
  let cart: CartItem[] = [
    {
      cartLineId: 'line-tentacion',
      menuItem: burger,
      quantity: 3,
      customization: {
        removedIngredients: ['Queso cheddar'],
        selectedExtras: [extraBacon],
        isGlutenFreeBread: true,
        specialInstructions: 'Poco hecha',
      },
      itemSubtotal: 40.5,
    },
  ];

  // Tap 1: 3 -> 2
  cart = decrementProductInCart(cart, 'la-tentacion');
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);
  assert.equal(cart[0].itemSubtotal, 27.0);
  assert.deepEqual(cart[0].customization.removedIngredients, ['Queso cheddar']);
  assert.equal(cart[0].customization.selectedExtras.length, 1);
  assert.equal(cart[0].customization.isGlutenFreeBread, true);
  assert.equal(cart[0].customization.specialInstructions, 'Poco hecha');

  // Tap 2: 2 -> 1
  cart = decrementProductInCart(cart, 'la-tentacion');
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 1);
  assert.equal(cart[0].itemSubtotal, 13.5);
  assert.deepEqual(cart[0].customization.removedIngredients, ['Queso cheddar']);

  // Tap 3: 1 -> 0 (removed entirely)
  cart = decrementProductInCart(cart, 'la-tentacion');
  assert.equal(cart.length, 0);
  assert.equal(calculateCartSummary(cart).totalQuantity, 0);
  assert.equal(calculateCartSummary(cart).total, 0);

  // Tap 4 on empty cart / missing item: safe no-op, no negative quantities
  const afterMissing = decrementProductInCart(cart, 'la-tentacion');
  assert.equal(afterMissing.length, 0);
});

test('serializeCartItems and restoreCartItems persist and restore cart with accurate recalculated totals', () => {
  const burger: MenuItem = {
    id: 'la-tentacion',
    name: 'La Tentación',
    ingredients: ['Dos carnes smash premium', 'Queso cheddar'],
    removableIngredients: ['Queso cheddar'],
    price: 11.9,
    category: 'hamburguesas',
  };
  const extraCheese: MenuExtra = { id: 'cheddar', name: 'Cheddar', price: 1.5, group: 'cheeses' };

  const original: CartItem[] = [
    {
      cartLineId: 'line-101',
      menuItem: burger,
      quantity: 2,
      customization: {
        removedIngredients: ['Queso cheddar'],
        selectedExtras: [extraCheese],
        isGlutenFreeBread: true,
        specialInstructions: 'Bien hecha',
      },
      itemSubtotal: 26.8, // (11.9 + 1.5) * 2
    },
  ];

  const serialized = serializeCartItems(original);
  const restored = restoreCartItems(serialized);
  assert.equal(restored.length, 1);
  assert.equal(restored[0].quantity, 2);
  assert.equal(restored[0].itemSubtotal, 26.8);
  assert.deepEqual(restored[0].customization.removedIngredients, ['Queso cheddar']);
  assert.equal(restored[0].customization.selectedExtras[0].id, 'cheddar');
  assert.equal(restored[0].customization.isGlutenFreeBread, true);
  assert.equal(restored[0].customization.specialInstructions, 'Bien hecha');

  // Corrupt or empty strings safely return []
  assert.deepEqual(restoreCartItems(null), []);
  assert.deepEqual(restoreCartItems('invalid-json'), []);
});

test('buildWhatsAppOrderMessage includes essential order metadata, beyond option and included sides', () => {
  const dummyItem: CartItem = {
    cartLineId: 'item-1',
    menuItem: {
      id: 'la-serrana',
      name: 'La Serrana',
      ingredients: ['Dos carnes smash premium', 'Queso gouda', 'Pimientos fritos', 'Bacon', 'Tomate'],
      removableIngredients: ['Queso gouda', 'Pimientos fritos', 'Bacon', 'Tomate'],
      price: 12.0,
      category: 'hamburguesas',
      includedSides: 'Incluye patatas fritas',
    },
    quantity: 1,
    customization: {
      selectedChoice: 'Mojo picón',
      isBeyondSubstitution: true,
      isGlutenFreeBread: true,
      removedIngredients: ['Tomate'],
      selectedExtras: [{ id: 'extra-egg', name: 'Huevo', price: 1.0, group: 'other' }],
      specialInstructions: 'Bien hecha por favor',
    },
    itemSubtotal: 14.0, // 12 + 1 (beyond) + 1 (egg)
  };

  const message = buildWhatsAppOrderMessage([dummyItem], {
    name: 'Rafael Guillén',
    phone: '600 123 456',
    pickupTime: '21:30',
    orderNotes: 'Cubiertos por favor',
  });

  assert.ok(message.includes('Hola, quiero hacer un pedido para recoger en el local'));
  assert.ok(message.includes('Rafael Guillén'));
  assert.ok(message.includes('La Serrana'));
  assert.ok(message.includes('Mojo picón'));
  assert.ok(message.includes('Sustitución Beyond'));
  assert.ok(message.includes('Pan sin gluten'));
  assert.ok(message.includes('Sin: Tomate'));
  assert.ok(message.includes('Extras: +Huevo (1,00 €)'));
  assert.ok(message.includes('14,00 €'));
});
