import React, { useState, useEffect } from 'react';
import { Navbar, type NavView } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { PromotionsSection } from './components/PromotionsSection';
import { ReservationsSection } from './components/ReservationsSection';
import { DeliverySection } from './components/DeliverySection';
import { GallerySection } from './components/GallerySection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { HomeContactAndHours } from './components/HomeContactAndHours';
import { GoogleReviewsCarousel } from './components/GoogleReviewsCarousel';
import { CartDrawer } from './components/CartDrawer';
import { ProductCustomizeModal } from './components/ProductCustomizeModal';
import { LegalModal, type LegalTab } from './components/LegalModal';
import { CookieBanner } from './components/CookieBanner';
import { AmbientFlames } from './components/AmbientFlames';
import type { MenuItem, CartItem, CartCustomization } from './types/restaurant';
import {
  calculateLinePrice,
  calculateCartSummary,
  decrementProductInCart,
  CART_STORAGE_KEY,
  serializeCartItems,
  restoreCartItems,
} from './utils/pricing';
import { RESTAURANT_INFO } from './data/restaurantInfo';

const HASH_VIEW_MAP: Record<string, NavView> = {
  'inicio': 'inicio',
  'promociones': 'inicio',
  'menu': 'menu',
  'carta': 'menu',
  'fuera-de-carta': 'menu',
  'menu-del-dia': 'menu',
  'reservas': 'reservas',
  'reserva': 'reservas',
  'pedidos-a-domicilio': 'delivery',
  'delivery': 'delivery',
  'domicilio': 'delivery',
  'galeria': 'galeria',
  'contacto': 'contacto',
  'ubicacion': 'contacto',
};

const VIEW_HASH_MAP: Record<NavView, string> = {
  inicio: '#inicio',
  menu: '#menu',
  reservas: '#reservas',
  delivery: '#pedidos-a-domicilio',
  galeria: '#galeria',
  contacto: '#contacto',
};

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<NavView>(() => {
    if (typeof window !== 'undefined') {
      const rawHash = window.location.hash.replace('#', '').toLowerCase();
      if (rawHash && HASH_VIEW_MAP[rawHash]) {
        return HASH_VIEW_MAP[rawHash];
      }
    }
    return 'inicio';
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return restoreCartItems(window.localStorage.getItem(CART_STORAGE_KEY));
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('aviso-legal');
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  // Sync cartItems with localStorage whenever cart changes; clear storage when empty
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (cartItems.length === 0) {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      } else {
        window.localStorage.setItem(CART_STORAGE_KEY, serializeCartItems(cartItems));
      }
    } catch {
      // Ignore storage quota/privacy errors
    }
  }, [cartItems]);

  const handleOpenLegal = (tab: LegalTab) => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  // Sync active view with browser back/forward hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '').toLowerCase();
      const matched = HASH_VIEW_MAP[rawHash] || 'inicio';
      setActiveView(matched);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: NavView) => {
    setActiveView(view);
    const targetHash = VIEW_HASH_MAP[view];
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick Add (with default recipe and no extra options)
  const handleQuickAdd = (item: MenuItem) => {
    const lineId = `${item.id}-${Date.now()}`;
    const newItem: CartItem = {
      cartLineId: lineId,
      menuItem: item,
      quantity: 1,
      customization: {
        removedIngredients: [],
        selectedExtras: [],
        selectedChoice: item.requiredChoice?.options[0],
      },
      itemSubtotal: item.price,
    };

    setCartItems((prev) => [...prev, newItem]);
    // Stay on menu without automatically opening cart drawer
  };

  // Remove 1 unit of a dish from the menu card (−1 button), preserving customizations
  const handleDecrementMenuItem = (item: MenuItem) => {
    setCartItems((prev) => decrementProductInCart(prev, item.id));
  };

  // Open customization modal
  const handleOpenCustomize = (item: MenuItem) => {
    setCustomizingItem(item);
    setIsCustomizeOpen(true);
  };

  // Add customized item from modal
  const handleAddCustomizedToCart = (
    item: MenuItem,
    customization: CartCustomization,
    quantity: number,
    totalPrice: number
  ) => {
    const lineId = `${item.id}-${Date.now()}`;
    const newItem: CartItem = {
      cartLineId: lineId,
      menuItem: item,
      quantity,
      customization,
      itemSubtotal: totalPrice,
    };

    setCartItems((prev) => [...prev, newItem]);
    // Stay on menu without automatically opening cart drawer
  };

  // Quantity updates in cart
  const handleUpdateQuantity = (cartLineId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((line) => {
          if (line.cartLineId !== cartLineId) return line;
          const newQty = line.quantity + delta;
          if (newQty <= 0) return null;
          const updatedLinePrice = calculateLinePrice(
            line.menuItem.price,
            line.customization.selectedExtras,
            newQty,
            line.customization.isBeyondSubstitution
          );
          return {
            ...line,
            quantity: newQty,
            itemSubtotal: updatedLinePrice,
          };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove specific item from cart
  const handleRemoveItem = (cartLineId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartLineId !== cartLineId));
  };

  // Clear entire cart and remove persisted storage
  const handleClearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  };

  const { totalQuantity } = calculateCartSummary(cartItems);

  return (
    <div className="min-h-screen bg-black text-[#f4f4f5] flex flex-col font-sans">
      {/* 1. RESTORED TOP NAVIGATION BAR (matching across all pages) */}
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        cartItemCount={totalQuantity}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1 relative overflow-hidden bg-black">
        <AmbientFlames />
        <div className="relative z-10">
          {/* ======================================================== */}
          {/* 1. SECCIÓN INICIO (HOMEPAGE)                             */}
          {/* Kept mounted so Hero video preserves playback/final frame*/}
          {/* ======================================================== */}
          <div
            className={activeView === 'inicio' ? 'block' : 'hidden'}
            aria-hidden={activeView !== 'inicio'}
          >
            {/* 2 & 3. Video Hero & 3 Action Buttons (MENÚ, RESERVAS, DOMICILIO) */}
            <Hero onNavigate={handleNavigate} isActive={activeView === 'inicio'} />

            {/* 4. Stopwatch Challenge Section (directly below action buttons) */}
            <PromotionsSection />

            {/* 5. Main Contact & Opening-Hours Cards (immediately below challenge / hero flow) */}
            <HomeContactAndHours onNavigate={handleNavigate} />

            {/* 6. Dedicated Google Reviews Carousel */}
            <GoogleReviewsCarousel />
          </div>

          {/* ======================================================== */}
          {/* 2. SECCIÓN MENÚ / CARTA DIGITAL COMPLETA                 */}
          {/* ======================================================== */}
          <div
            className={activeView === 'menu' ? 'block' : 'hidden'}
            aria-hidden={activeView !== 'menu'}
          >
            <MenuSection
              cartItems={cartItems}
              onCustomize={handleOpenCustomize}
              onQuickAdd={handleQuickAdd}
              onDecrementItem={handleDecrementMenuItem}
            />
          </div>

          {/* ======================================================== */}
          {/* 3. SECCIÓN RESERVAS                                      */}
          {/* ======================================================== */}
          {activeView === 'reservas' && (
            <ReservationsSection
              onGoToHome={() => handleNavigate('inicio')}
              onGoToMenu={() => handleNavigate('menu')}
            />
          )}

          {/* ======================================================== */}
          {/* 4. SECCIÓN PEDIDOS A DOMICILIO                          */}
          {/* ======================================================== */}
          {activeView === 'delivery' && (
            <DeliverySection
              onGoToHome={() => handleNavigate('inicio')}
              onGoToMenu={() => handleNavigate('menu')}
            />
          )}

          {/* ======================================================== */}
          {/* 5. SECCIÓN GALERÍA (AFTER DELIVERY, BEFORE CONTACTO)     */}
          {/* ======================================================== */}
          {activeView === 'galeria' && (
            <GallerySection
              onGoToHome={() => handleNavigate('inicio')}
              onGoToMenu={() => handleNavigate('menu')}
            />
          )}

          {/* ======================================================== */}
          {/* 6. SECCIÓN CONTACTO Y LOCALIZACIÓN                       */}
          {/* ======================================================== */}
          {activeView === 'contacto' && (
            <LocationSection
              onGoToHome={() => handleNavigate('inicio')}
              onGoToMenu={() => handleNavigate('menu')}
            />
          )}
        </div>
      </main>

      {/* Global Footer (clean without duplicated map section) */}
      <Footer onOpenLegal={handleOpenLegal} />

      {/* Legal Compliance Modal (LSSI-CE, RGPD, Cookies, Consumo) */}
      <LegalModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        initialTab={legalTab}
      />

      {/* Compliant Cookie Consent Banner */}
      <CookieBanner onOpenLegal={handleOpenLegal} />

      {/* Shopping Cart Drawer for Pickup orders */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Product Customization Modal */}
      <ProductCustomizeModal
        item={customizingItem}
        isOpen={isCustomizeOpen}
        onClose={() => {
          setIsCustomizeOpen(false);
          setCustomizingItem(null);
        }}
        onAddToCart={handleAddCustomizedToCart}
      />
    </div>
  );
};
export default App;
