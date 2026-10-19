export interface GalleryPhotoItem {
  id: string;
  /** Relative path in /public (e.g. '/gallery/smash-burger-1.jpg'). Leave empty until the real photograph is uploaded. */
  src?: string;
  /** Descriptive alt text matching the real photograph once uploaded. */
  alt?: string;
  category: string;
  slotTitle: string;
  aspectClass?: string;
}

/**
 * Maintainable gallery configuration ready to receive real photographs of La Tentación Burger.
 * To add real photographs later, place the image files in `/public/gallery/` and set `src` and `alt` below.
 * No fabricated or stock images are used when `src` is empty.
 */
export const GALLERY_ITEMS: GalleryPhotoItem[] = [
  {
    id: 'gallery-slot-1',
    category: 'Smash Burgers',
    slotTitle: 'Doble Smash & Cheddar Fundido',
  },
  {
    id: 'gallery-slot-2',
    category: 'Especialidades',
    slotTitle: 'La Tentación & Salsas Artesanas',
  },
  {
    id: 'gallery-slot-3',
    category: 'Entrantes & Baguettes',
    slotTitle: 'Raciones, Nachos y Baguettes Crujientes',
  },
  {
    id: 'gallery-slot-4',
    category: 'El Local · Sevilla',
    slotTitle: 'Ambiente en Barriada de San Diego',
  },
  {
    id: 'gallery-slot-5',
    category: 'Fuera de Carta',
    slotTitle: 'Creaciones Especiales y Carnes Maduradas',
  },
  {
    id: 'gallery-slot-6',
    category: 'Postres Caseros',
    slotTitle: 'Tentación Oreo, Lotus y KitKat',
  },
];
