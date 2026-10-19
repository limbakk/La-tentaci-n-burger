export interface ScheduleDay {
  day: string;
  shifts: string;
  isOpen: boolean;
  note?: string;
}

export interface GoogleReview {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  rating: number; // 1 to 5
  relativeTimeDescription?: string;
  publishTime?: string;
  text: string;
}

export const RESTAURANT_INFO = {
  name: 'La Tentación Burger',
  slogan: 'Un pecado de sabor',
  heroHeadline: 'Caer en la tentación nunca fue un pecado',
  address: {
    street: 'Barriada de San Diego',
    city: 'Sevilla',
    postalCode: '41015',
    full: 'Barriada de San Diego, Sevilla, 41015',
  },
  phone: {
    display: '686 610 140',
    clean: '686610140',
    international: '+34686610140',
  },
  social: {
    instagram: {
      handle: '@Latentacion.burger',
      url: 'https://www.instagram.com/Latentacion.burger/',
    },
    tiktok: {
      handle: '@Latentacionburger_',
      url: 'https://www.tiktok.com/@Latentacionburger_',
    },
  },
  delivery: {
    glovo: {
      name: 'Glovo',
      isConfigured: true,
      isVerified: true,
      url: 'https://glovoapp.com/es/es/sevilla/stores/la-tentacion-burger-sevilla',
      tagline: 'Tienda oficial en Sevilla',
    },
    uberEats: {
      name: 'Uber Eats',
      isConfigured: false,
      url: '',
      tagline: 'Entrega a domicilio',
      ratingNote: 'Calificado por el negocio con 5 estrellas (información facilitada por el establecimiento).',
      configNote: 'Enlace específico de La Tentación Burger en Uber Eats pendiente de configurar.',
    },
    justEat: {
      name: 'Just Eat',
      isConfigured: false,
      url: '',
      tagline: 'Próximamente disponible',
      configNote: 'Enlace específico de La Tentación Burger en Just Eat pendiente de configurar.',
    },
    notices: [
      '¿Quieres recibir tu pedido en casa? Realiza tu pedido directamente a través de nuestras plataformas de reparto. La web no procesa pedidos a domicilio.',
      'Los pedidos a domicilio se gestionan en la plataforma de reparto elegida. No completes un pedido de entrega desde esta web.',
    ],
  },
  disclaimer: {
    badge: 'Demo Comercial Privada',
    creator: 'La Casa de los Inventos',
    text: 'Esta es una demo comercial privada creada por La Casa de los Inventos. No publicar ni desplegar como sitio web oficial de La Tentación Burger.',
  },
  schedule: [
    { day: 'Lunes', shifts: 'Consultar', isOpen: false, note: 'Horario no suministrado' },
    { day: 'Martes', shifts: '20:30 – 23:30', isOpen: true },
    { day: 'Miércoles', shifts: '13:30 – 16:00 | 20:30 – 23:30', isOpen: true },
    { day: 'Jueves', shifts: '13:30 – 16:00 | 20:30 – 23:30', isOpen: true },
    { day: 'Viernes', shifts: '13:30 – 16:30 | 20:30 – 00:00', isOpen: true },
    { day: 'Sábado', shifts: '13:30 – 16:30 | 20:30 – 00:00', isOpen: true },
    { day: 'Domingo', shifts: '13:30 – 16:30 | 20:30 – 00:00', isOpen: true },
  ] as ScheduleDay[],
  dailyMenu: {
    price: 12.5,
    title: 'Menú del Día',
    availabilityHours: '13:00–16:30',
    burgerOfTheDay: '',
    defaultFallbackText: 'Los platos del menú del día pueden variar diariamente. Consulta en el local las opciones disponibles hoy.',
  },
  stopwatchChallenge: {
    title: 'RETO DEL CRONÓMETRO: ¡PÁRALO EN 10 SEGUNDOS Y GANA!',
    targetSeconds: 10.0,
    toleranceSeconds: 0.0,
    advertisedPrize: 'CONSIGUE TU BURGER GRATIS',
    minimumOrderAmount: 25.0,
    rules: [
      'Páralo en exactamente 10 segundos.',
      'Consigue tu burger gratis (una hamburguesa gratis).',
      'Consumo mínimo de 25 € en el local.',
    ],
    disclaimer: 'Esta es una demo promocional interactiva. El intento extra se gestiona mediante verificación en Instagram o TikTok (máximo un intento adicional por participante entre ambas plataformas).',
  },
  googleReviews: {
    title: 'Valoraciones en Google',
    subtitle: 'La Tentación Burger · Sevilla',
    // Verified Google Maps profile query URL
    reviewsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('La Tentación Burger Barriada de San Diego Sevilla'),
    writeReviewUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('La Tentación Burger Barriada de San Diego Sevilla'),
    // Optional Google Place ID for server-side Places API integration
    placeId: '',
    // Genuine reviews list: left empty until live official provider is connected
    reviews: [] as GoogleReview[],
    isLiveConnected: false,
  },
};
