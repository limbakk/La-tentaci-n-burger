import type { MenuCategory, MenuItem, MenuExtra, ExtraGroupId } from '../types/restaurant';

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'hamburguesas', name: 'Hamburguesas', tagline: 'Incluyen patatas fritas · Opción pan sin gluten' },
  { id: 'entrantes', name: 'Entrantes', tagline: 'Para empezar y compartir' },
  { id: 'baguettes', name: 'Baguettes', tagline: 'Crujientes con patatas fritas incluidas' },
  { id: 'tenta-kids', name: 'Tenta Kids', tagline: 'Menús infantiles con patatas, postre Oreo petit y bebida' },
  { id: 'bebidas', name: 'Bebidas', tagline: 'Refrescos embotellados, zumo, agua y cervezas' },
  { id: 'postres', name: 'Postres', tagline: 'Tentaciones dulces por 5,00 €' },
  { id: 'fuera-de-carta', name: 'Fuera de Carta', tagline: 'Creaciones especiales, croquetas y bowls' },
];

export const EXTRA_GROUPS: { id: ExtraGroupId; name: string; priceText: string }[] = [
  { id: 'cheeses', name: 'Quesos', priceText: '1,50 € / ud' },
  { id: 'other', name: 'Otros extras', priceText: '1,00 € / ud' },
  { id: 'vegetables', name: 'Verduras', priceText: '1,00 € / ud' },
  { id: 'sauces', name: 'Salsas', priceText: '1,00 € / ud' },
];

export const AVAILABLE_EXTRAS: MenuExtra[] = [
  // Quesos — 1,50 € each
  { id: 'cheese-parmesan', name: 'Parmesano', price: 1.5, group: 'cheeses' },
  { id: 'cheese-cheddar', name: 'Cheddar', price: 1.5, group: 'cheeses' },
  { id: 'cheese-truffle', name: 'Queso trufado', price: 1.5, group: 'cheeses' },
  { id: 'cheese-cream', name: 'Queso crema', price: 1.5, group: 'cheeses' },
  { id: 'cheese-gouda', name: 'Gouda', price: 1.5, group: 'cheeses' },
  { id: 'cheese-monterey', name: 'Monterey', price: 1.5, group: 'cheeses' },

  // Otros extras — 1,00 € each
  { id: 'extra-bacon', name: 'Bacon', price: 1.0, group: 'other' },
  { id: 'extra-egg', name: 'Huevo', price: 1.0, group: 'other' },
  { id: 'extra-pulled-pork', name: 'Pulled pork', price: 1.0, group: 'other' },
  { id: 'extra-caramelized-onion', name: 'Cebolla caramelizada', price: 1.0, group: 'other' },

  // Verduras — 1,00 € each
  { id: 'veg-lettuce', name: 'Lechuga', price: 1.0, group: 'vegetables' },
  { id: 'veg-tomato', name: 'Tomate', price: 1.0, group: 'vegetables' },
  { id: 'veg-white-onion', name: 'Cebolla blanca', price: 1.0, group: 'vegetables' },
  { id: 'veg-red-onion', name: 'Cebolla morada', price: 1.0, group: 'vegetables' },
  { id: 'veg-pickles', name: 'Pepinillos picados', price: 1.0, group: 'vegetables' },
  { id: 'veg-mushrooms', name: 'Champiñones', price: 1.0, group: 'vegetables' },

  // Salsas — 1,00 € each
  { id: 'sauce-bbq', name: 'Barbacoa', price: 1.0, group: 'sauces' },
  { id: 'sauce-mayomost', name: 'Mayomost', price: 1.0, group: 'sauces' },
  { id: 'sauce-mayopepi', name: 'Mayo pepi', price: 1.0, group: 'sauces' },
  { id: 'sauce-truffle-mayo', name: 'Mayonesa trufada', price: 1.0, group: 'sauces' },
  { id: 'sauce-tentacion', name: 'Salsa La Tentación', price: 1.0, group: 'sauces' },
  { id: 'sauce-mojo-picon', name: 'Mojo picón', price: 1.0, group: 'sauces' },
  { id: 'sauce-alioli', name: 'Alioli', price: 1.0, group: 'sauces' },
];

export const STANDARD_SAUCE_CHOICES = [
  'Barbacoa',
  'Mayomost',
  'Mayo pepi',
  'Mayonesa trufada',
  'Salsa La Tentación',
  'Mojo picón',
  'Alioli',
];

export const ALL_EXTRA_GROUPS: ExtraGroupId[] = ['cheeses', 'other', 'vegetables', 'sauces'];

export const MENU_ITEMS: MenuItem[] = [
  // ==========================================
  // 1. HAMBURGUESAS (REGULAR BURGER MENU)
  // All include French fries. Gluten-free bread available (0,00 €).
  // Beyond plant-based patty substitution (+1,00 €).
  // ==========================================
  {
    id: 'la-clasica',
    name: 'La Clásica',
    ingredients: [
      'Dos carnes smash premium',
      'Queso cheddar',
      'Lechuga',
      'Tomate',
      'Mayomost',
    ],
    removableIngredients: [
      'Queso cheddar',
      'Lechuga',
      'Tomate',
      'Mayomost',
    ],
    price: 10.9,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
    allowsGlutenFreeBread: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'la-tentacion',
    name: 'La Tentación',
    ingredients: [
      'Dos carnes smash premium',
      'Queso cheddar',
      'Bacon',
      'Cebolla frita',
      'Huevo',
      'Salsa La Tentación',
    ],
    removableIngredients: [
      'Queso cheddar',
      'Bacon',
      'Cebolla frita',
      'Huevo',
      'Salsa La Tentación',
    ],
    price: 11.9,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
    allowsGlutenFreeBread: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'la-trufada',
    name: 'La Trufada',
    ingredients: [
      'Dos carnes smash premium',
      'Queso trufado',
      'Bacon',
      'Mayonesa trufada',
    ],
    removableIngredients: [
      'Queso trufado',
      'Bacon',
      'Mayonesa trufada',
    ],
    price: 12.5,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
    allowsGlutenFreeBread: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'la-pepi',
    name: 'La Pepi',
    ingredients: [
      'Dos carnes smash premium',
      'Queso cheddar',
      'Bacon',
      'Pepinillos picados',
      'Cebolla picada',
      'Mayo pepi',
    ],
    removableIngredients: [
      'Queso cheddar',
      'Bacon',
      'Pepinillos picados',
      'Cebolla picada',
      'Mayo pepi',
    ],
    price: 10.9,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
    allowsGlutenFreeBread: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'la-empana',
    name: 'La Empaná',
    ingredients: [
      'Pollo empanado',
      'Queso cheddar',
      'Lechuga',
      'Mayobacon',
    ],
    removableIngredients: [
      'Queso cheddar',
      'Lechuga',
      'Mayobacon',
    ],
    price: 10.9,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
    allowsGlutenFreeBread: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'la-serrana',
    name: 'La Serrana',
    ingredients: [
      'Dos carnes smash premium',
      'Queso gouda',
      'Pimientos fritos',
      'Bacon',
      'Tomate',
      'Elección de salsa: Alioli o Mojo picón',
    ],
    removableIngredients: [
      'Queso gouda',
      'Pimientos fritos',
      'Bacon',
      'Tomate',
    ],
    price: 12.0,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
    allowsGlutenFreeBread: true,
    requiredChoice: {
      label: 'Salsa a elegir',
      options: ['Alioli', 'Mojo picón'],
      defaultOption: 'Alioli',
    },
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'la-nachos',
    name: 'La Nachos',
    ingredients: [
      'Dos carnes smash premium',
      'Queso cheddar',
      'Chilli con carne',
      'Nachos',
      'Mayonesa de jalapeño',
    ],
    removableIngredients: [
      'Queso cheddar',
      'Chilli con carne',
      'Nachos',
      'Mayonesa de jalapeño',
    ],
    price: 11.9,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
    allowsGlutenFreeBread: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'la-cerda',
    name: 'La Cerda',
    ingredients: [
      'Dos carnes smash premium',
      'Salsa cheddar',
      'Bacon',
      'Pulled pork',
      'Huevo',
      'Salsa barbacoa',
    ],
    removableIngredients: [
      'Salsa cheddar',
      'Bacon',
      'Pulled pork',
      'Huevo',
      'Salsa barbacoa',
    ],
    price: 12.5,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
    allowsGlutenFreeBread: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'la-cuki',
    name: 'La Cuki',
    ingredients: [
      'Dos carnes smash premium',
      'Crema de queso de cabra',
      'Cebolla caramelizada',
      'Bacon picado',
    ],
    removableIngredients: [
      'Crema de queso de cabra',
      'Cebolla caramelizada',
      'Bacon picado',
    ],
    price: 12.5,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
    allowsGlutenFreeBread: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'la-moruna',
    name: 'La Moruna',
    ingredients: [
      'Una carne de 90 g',
      'Medallón de pollo empanado',
      'Queso cheddar',
      'Bacon',
      'Mayo moruna',
    ],
    removableIngredients: [
      'Queso cheddar',
      'Bacon',
      'Mayo moruna',
    ],
    price: 11.9,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
    allowsGlutenFreeBread: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'cheese-burger',
    name: 'Cheese Burger',
    ingredients: [
      'Dos carnes smash burger',
      'Queso',
    ],
    removableIngredients: [
      'Queso',
    ],
    price: 9.9,
    category: 'hamburguesas',
    includedSides: 'Incluye patatas fritas',
    allowsGlutenFreeBread: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },

  // ==========================================
  // 2. ENTRANTES (STARTERS)
  // ==========================================
  {
    id: 'crispy-chicken-wings',
    name: 'Crispy Chicken Wings',
    description: 'Siete alitas de pollo empanadas con salsa barbacoa.',
    ingredients: [
      'Siete alitas de pollo empanadas',
      'Salsa barbacoa',
    ],
    removableIngredients: [
      'Salsa barbacoa',
    ],
    price: 6.5,
    category: 'entrantes',
    applicableExtraGroups: ['sauces'],
  },
  {
    id: 'nachos',
    name: 'Nachos',
    ingredients: [
      'Guacamole',
      'Chilli con carne',
      'Tomate',
      'Jalapeños',
      'Salsa cheddar',
    ],
    removableIngredients: [
      'Guacamole',
      'Chilli con carne',
      'Tomate',
      'Jalapeños',
      'Salsa cheddar',
    ],
    price: 8.5,
    category: 'entrantes',
    applicableExtraGroups: ['cheeses', 'sauces'],
  },
  {
    id: 'patatas-rancheras',
    name: 'Patatas Rancheras',
    ingredients: [
      'Bacon picado',
      'Salsa cheddar',
      'Salsa ranchera',
    ],
    removableIngredients: [
      'Bacon picado',
      'Salsa cheddar',
      'Salsa ranchera',
    ],
    price: 8.5,
    category: 'entrantes',
    applicableExtraGroups: ['cheeses', 'other', 'sauces'],
  },
  {
    id: 'fingers-de-pollo',
    name: 'Fingers de Pollo',
    description: 'Siete fingers de pollo crujientes servidos con salsa a elegir.',
    ingredients: [
      'Siete fingers de pollo',
      'Salsa a elegir',
    ],
    removableIngredients: [],
    price: 6.5,
    category: 'entrantes',
    requiredChoice: {
      label: 'Salsa a elegir',
      options: STANDARD_SAUCE_CHOICES,
      defaultOption: 'Barbacoa',
    },
    applicableExtraGroups: ['sauces'],
  },
  {
    id: 'nuggets-pollo-queso',
    name: 'Nuggets de Pollo Queso',
    description: 'Seis nuggets de pollo con cheddar servidos con salsa a elegir.',
    ingredients: [
      'Seis nuggets de pollo con cheddar',
      'Salsa a elegir',
    ],
    removableIngredients: [],
    price: 6.0,
    category: 'entrantes',
    requiredChoice: {
      label: 'Salsa a elegir',
      options: STANDARD_SAUCE_CHOICES,
      defaultOption: 'Barbacoa',
    },
    applicableExtraGroups: ['sauces'],
  },
  {
    id: 'aros-de-gouda',
    name: 'Aros de Gouda',
    description: 'Seis aros de Gouda fundente servidos con salsa a elegir.',
    ingredients: [
      'Seis aros de Gouda',
      'Salsa a elegir',
    ],
    removableIngredients: [],
    price: 6.5,
    category: 'entrantes',
    requiredChoice: {
      label: 'Salsa a elegir',
      options: STANDARD_SAUCE_CHOICES,
      defaultOption: 'Barbacoa',
    },
    applicableExtraGroups: ['sauces'],
  },

  // ==========================================
  // 3. BAGUETTES
  // All include French fries.
  // ==========================================
  {
    id: 'el-serranito',
    name: 'El Serranito',
    ingredients: [
      'Pollo',
      'Queso gouda',
      'Bacon',
      'Pimientos',
      'Tomate',
      'Tortilla',
      'Elección de salsa: Alioli o Mojo picón',
    ],
    removableIngredients: [
      'Queso gouda',
      'Bacon',
      'Pimientos',
      'Tomate',
      'Tortilla',
    ],
    price: 6.5,
    category: 'baguettes',
    includedSides: 'Incluye patatas fritas',
    requiredChoice: {
      label: 'Salsa a elegir',
      options: ['Alioli', 'Mojo picón'],
      defaultOption: 'Alioli',
    },
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'el-borracho',
    name: 'El Borracho',
    ingredients: [
      'Pollo',
      'Patatas fritas',
      'Salsa al whisky',
    ],
    removableIngredients: [
      'Patatas fritas',
      'Salsa al whisky',
    ],
    price: 6.0,
    category: 'baguettes',
    includedSides: 'Incluye patatas fritas',
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'el-caserio',
    name: 'El Caserío',
    ingredients: [
      'Pollo',
      'Queso gouda',
      'Queso americano',
      'Bacon',
      'Salsa de queso de cabra',
    ],
    removableIngredients: [
      'Queso gouda',
      'Queso americano',
      'Bacon',
      'Salsa de queso de cabra',
    ],
    price: 6.5,
    category: 'baguettes',
    includedSides: 'Incluye patatas fritas',
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'el-empanao',
    name: 'El Empanao',
    ingredients: [
      'Pollo empanado',
      'Queso americano',
      'Lechuga',
      'Bacon',
      'Mayomost',
    ],
    removableIngredients: [
      'Queso americano',
      'Lechuga',
      'Bacon',
      'Mayomost',
    ],
    price: 6.5,
    category: 'baguettes',
    includedSides: 'Incluye patatas fritas',
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },

  // ==========================================
  // 4. CHILDREN'S MENU — TENTA KIDS
  // Both include French fries, an Oreo petit dessert and a drink (juice or water).
  // ==========================================
  {
    id: 'tenta-kids-burguer',
    name: 'Burguer',
    description: 'Menú infantil con una hamburguesa de 80 g con queso cheddar, patatas fritas, postre Oreo petit y bebida a elegir.',
    ingredients: [
      'Hamburguesa de 80 g',
      'Queso cheddar',
      'Patatas fritas',
      'Postre Oreo petit',
      'Bebida a elegir (Zumo o Agua)',
    ],
    removableIngredients: [
      'Queso cheddar',
    ],
    price: 7.2,
    category: 'tenta-kids',
    includedSides: 'Incluye patatas fritas + postre Oreo petit',
    allowsGlutenFreeBread: true,
    requiredChoice: {
      label: 'Bebida infantil',
      options: ['Zumo', 'Agua'],
      defaultOption: 'Zumo',
    },
  },
  {
    id: 'tenta-kids-nuggets',
    name: 'Nuggets',
    description: 'Menú infantil con nuggets de pollo con queso, patatas fritas, postre Oreo petit y bebida a elegir.',
    ingredients: [
      'Nuggets de pollo con queso',
      'Patatas fritas',
      'Postre Oreo petit',
      'Bebida a elegir (Zumo o Agua)',
    ],
    removableIngredients: [],
    price: 7.2,
    category: 'tenta-kids',
    includedSides: 'Incluye patatas fritas + postre Oreo petit',
    requiredChoice: {
      label: 'Bebida infantil',
      options: ['Zumo', 'Agua'],
      defaultOption: 'Zumo',
    },
  },

  // ==========================================
  // 5. BEBIDAS (DRINKS)
  // Bottled soft drinks 2,50 € · Juice and water 1,50 € · Beers
  // ==========================================
  // Soft drinks — 2,50 € each
  {
    id: 'coca-cola',
    name: 'Coca-Cola',
    description: 'Refresco embotellado.',
    ingredients: ['Refresco de cola embotellado'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },
  {
    id: 'coca-cola-zero',
    name: 'Coca-Cola Zero',
    description: 'Refresco embotellado sin azúcar.',
    ingredients: ['Refresco de cola zero embotellado'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },
  {
    id: 'coca-cola-zero-zero',
    name: 'Coca-Cola Zero Zero',
    description: 'Refresco embotellado sin azúcar y sin cafeína.',
    ingredients: ['Refresco de cola zero zero embotellado'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },
  {
    id: 'fuz-tea-lemon',
    name: 'Fuz Tea limón',
    description: 'Té helado al limón embotellado.',
    ingredients: ['Té helado al limón'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },
  {
    id: 'fuz-tea-passion-fruit',
    name: 'Fuz Tea maracuyá',
    description: 'Té helado al maracuyá embotellado.',
    ingredients: ['Té helado con sabor a maracuyá'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },
  {
    id: 'aquarius-lemon',
    name: 'Aquarius limón',
    description: 'Bebida isotónica al limón embotellada.',
    ingredients: ['Bebida isotónica sabor limón'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },
  {
    id: 'aquarius-orange',
    name: 'Aquarius naranja',
    description: 'Bebida isotónica a la naranja embotellada.',
    ingredients: ['Bebida isotónica sabor naranja'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },
  {
    id: 'fanta-orange',
    name: 'Fanta naranja',
    description: 'Refresco sabor naranja embotellado.',
    ingredients: ['Refresco de naranja'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },
  {
    id: 'fanta-lemon',
    name: 'Fanta limón',
    description: 'Refresco sabor limón embotellado.',
    ingredients: ['Refresco de limón'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },
  {
    id: 'sprite',
    name: 'Sprite',
    description: 'Refresco de lima-limón embotellado.',
    ingredients: ['Refresco lima-limón'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },

  // Juice and water — 1,50 €
  {
    id: 'zumo',
    name: 'Zumo',
    description: 'Zumo embotellado.',
    ingredients: ['Zumo'],
    removableIngredients: [],
    price: 1.5,
    category: 'bebidas',
  },
  {
    id: 'agua-mineral',
    name: 'Agua',
    description: 'Agua mineral.',
    ingredients: ['Agua mineral'],
    removableIngredients: [],
    price: 1.5,
    category: 'bebidas',
  },

  // Beers
  {
    id: 'cerveza-botella',
    name: 'Cerveza tercio',
    description: 'Cerveza en botella de tercio.',
    ingredients: ['Cerveza en botella'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },
  {
    id: 'cerveza-cana',
    name: 'Caña de cerveza',
    description: 'Cerveza pequeña de barril.',
    ingredients: ['Cerveza de barril pequeña'],
    removableIngredients: [],
    price: 1.8,
    category: 'bebidas',
  },
  {
    id: 'cerveza-copa',
    name: 'Cerveza en copa',
    description: 'Cerveza servida en copa de cristal.',
    ingredients: ['Cerveza servida en copa'],
    removableIngredients: [],
    price: 2.5,
    category: 'bebidas',
  },

  // ==========================================
  // 6. POSTRES — 5,00 € EACH
  // ==========================================
  {
    id: 'tentacion-oreo',
    name: 'Tentación Oreo',
    ingredients: ['Tentación dulce de galleta Oreo'],
    removableIngredients: [],
    price: 5.0,
    category: 'postres',
  },
  {
    id: 'tentacion-kitkat',
    name: 'Tentación KitKat',
    ingredients: ['Tentación dulce de KitKat'],
    removableIngredients: [],
    price: 5.0,
    category: 'postres',
  },
  {
    id: 'tentacion-lotus',
    name: 'Tentación Lotus',
    ingredients: ['Tentación dulce con crema de galleta Lotus'],
    removableIngredients: [],
    price: 5.0,
    category: 'postres',
  },
  {
    id: 'tentacion-variada',
    name: 'Tentación variada',
    description: 'Postre especial sorpresa. Consulta las opciones disponibles.',
    ingredients: ['Postre especial sorpresa. Consulta las opciones disponibles.'],
    removableIngredients: [],
    price: 5.0,
    category: 'postres',
  },

  // ==========================================
  // 7. FUERA DE CARTA
  // Visually distinct category with same design system.
  // Note: Do not automatically add French fries or other sides to Fuera de Carta products.
  // ==========================================
  // Beef burgers
  {
    id: 'la-clasica-suprema',
    name: 'La Clásica Suprema',
    ingredients: [
      'Carne de vacuno de 180 g',
      'Lechuga',
      'Tomate',
      'Cebolla',
      'Mayonesa ahumada',
    ],
    removableIngredients: [
      'Lechuga',
      'Tomate',
      'Cebolla',
      'Mayonesa ahumada',
    ],
    price: 15.9,
    category: 'fuera-de-carta',
    isFueraDeCarta: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },
  {
    id: 'la-cabra-loca',
    name: 'La Cabra Loca',
    ingredients: [
      'Carne de vacuno de 180 g',
      'Queso de cabra',
      'Cebolla morada encurtida',
      'Bacon',
      'Mayopiqui',
    ],
    removableIngredients: [
      'Queso de cabra',
      'Cebolla morada encurtida',
      'Bacon',
      'Mayopiqui',
    ],
    price: 16.9,
    category: 'fuera-de-carta',
    isFueraDeCarta: true,
    applicableExtraGroups: ALL_EXTRA_GROUPS,
  },

  // Croquettes
  {
    id: 'croquetas-serranito',
    name: 'Croquetas Serranito',
    ingredients: ['Serranito'],
    removableIngredients: [],
    price: 6.5,
    category: 'fuera-de-carta',
    isFueraDeCarta: true,
  },
  {
    id: 'croquetas-arroz-negro',
    name: 'Croquetas Arroz negro con alioli',
    ingredients: ['Arroz negro con alioli'],
    removableIngredients: [],
    price: 7.0,
    category: 'fuera-de-carta',
    isFueraDeCarta: true,
  },

  // Rice bowl
  {
    id: 'chicken-bowl',
    name: 'Chicken Bowl',
    ingredients: [
      'Arroz basmati',
      'Pimiento verde',
      'Pimiento rojo',
      'Cebolla blanca',
      'Calabacín',
      'Espinacas',
      'Pollo',
      'Salsa teriyaki',
    ],
    removableIngredients: [
      'Pimiento verde',
      'Pimiento rojo',
      'Cebolla blanca',
      'Calabacín',
      'Espinacas',
      'Pollo',
      'Salsa teriyaki',
    ],
    price: 10.5,
    category: 'fuera-de-carta',
    isFueraDeCarta: true,
  },
];
