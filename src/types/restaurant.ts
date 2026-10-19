export type MenuCategoryKey =
  | 'hamburguesas'
  | 'entrantes'
  | 'baguettes'
  | 'tenta-kids'
  | 'bebidas'
  | 'postres'
  | 'fuera-de-carta'
  | 'menu-del-dia';

export interface MenuCategory {
  id: MenuCategoryKey;
  name: string;
  tagline: string;
  count?: number;
}

export type ExtraGroupId = 'cheeses' | 'other' | 'vegetables' | 'sauces';

export interface MenuExtra {
  id: string;
  name: string;
  price: number;
  group: ExtraGroupId;
}

export interface ProductRequiredChoice {
  label: string;
  options: string[];
  defaultOption?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  ingredients: string[];
  removableIngredients: string[];
  price: number;
  category: MenuCategoryKey;
  includedSides?: string;
  allowsBeyondSubstitution?: boolean; // +1.00 € (replaces meat patty)
  allowsGlutenFreeBread?: boolean; // 0.00 €
  requiredChoice?: ProductRequiredChoice;
  applicableExtraGroups?: ExtraGroupId[];
  isFueraDeCarta?: boolean;
  isDailyBurger?: boolean;
}

export interface CartCustomization {
  removedIngredients: string[];
  selectedExtras: MenuExtra[];
  isBeyondSubstitution?: boolean;
  isGlutenFreeBread?: boolean;
  selectedChoice?: string;
  specialInstructions?: string;
}

export interface CartItem {
  cartLineId: string;
  menuItem: MenuItem;
  quantity: number;
  customization: CartCustomization;
  itemSubtotal: number;
}

export interface CustomerOrderDetails {
  name: string;
  phone: string;
  pickupTime: string;
  orderNotes?: string;
}

export interface ReservationRequest {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
}
