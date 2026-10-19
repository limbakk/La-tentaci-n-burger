import React from 'react';
import { GALLERY_ITEMS, type GalleryPhotoItem } from '../data/gallery';
import { useViewportEntrance } from '../utils/useViewportEntrance';

interface GallerySectionProps {
  onGoToHome?: () => void;
  onGoToMenu?: () => void;
}

const GalleryCard: React.FC<{ item: GalleryPhotoItem; index: number }> = ({ item, index }) => {
  const { ref, entranceClassName } = useViewportEntrance<HTMLElement>();
  const hasRealPhoto = Boolean(item.src && item.src.trim() !== '');

  return (
    <article
      ref={ref}
      aria-label={hasRealPhoto ? item.alt || `Fotografía ${index + 1}` : `Espacio de galería ${index + 1}`}
      className={`embossed-card rounded-2xl overflow-hidden group ${entranceClassName}`}
    >
      <div className="relative aspect-[4/3] w-full bg-[#0b0b12] overflow-hidden">
        {hasRealPhoto ? (
          <img
            src={item.src}
            alt={item.alt || ''}
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#14141f] via-[#0e0e16] to-[#09090e]" />
        )}
      </div>
    </article>
  );
};

export const GallerySection: React.FC<GallerySectionProps> = () => {
  const { ref: headerRef, entranceClassName: headerEntrance } =
    useViewportEntrance<HTMLDivElement>();

  return (
    <section
      id="galeria"
      aria-labelledby="gallery-heading"
      className="pt-8 pb-16 sm:pt-10 sm:pb-24 bg-transparent relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          ref={headerRef}
          className={`text-center mb-8 ${headerEntrance}`}
        >
          <h1
            id="gallery-heading"
            className="font-display text-4xl sm:text-6xl font-bold uppercase tracking-tight text-white embossed-text-3d leading-none"
          >
            Galería
          </h1>
        </div>

        {/* Responsive Gallery Grid (1 col mobile, 2 cols tablet, 3 cols desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {GALLERY_ITEMS.map((item, idx) => (
            <GalleryCard key={item.id} item={item} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};
