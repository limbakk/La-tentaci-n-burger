import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, ExternalLink, MessageSquare, Quote, CheckCircle2 } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantInfo';
import { isValidReview, sortReviewsLatestFirst } from '../utils/googleReviews';

export const GoogleReviewsCarousel: React.FC = () => {
  const { reviewsUrl, writeReviewUrl, reviews } = RESTAURANT_INFO.googleReviews;

  // Filter and sort genuine reviews if available (recent first)
  const validReviews = sortReviewsLatestFirst(reviews.filter(isValidReview));
  const hasLiveReviews = validReviews.length > 0;

  // Carousel state for live reviews
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, validReviews.length - 1) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= validReviews.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = endX - touchStartX;
    if (Math.abs(deltaX) > 40 && validReviews.length > 1) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <section id="resenas-google" className="py-12 sm:py-16 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* =================================================================== */}
        {/* CASE 1: GENUINE LIVE REVIEWS CONNECTED (SWIPEABLE CAROUSEL)         */}
        {/* =================================================================== */}
        {hasLiveReviews ? (
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl sm:text-4xl font-bold uppercase text-white text-center mb-6 embossed-text-3d">
              Valoraciones en Google
            </h2>
            {/* Horizontally Swipeable Carousel Container */}
            <div
              className="relative touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="embossed-card rounded-2xl sm:rounded-3xl p-6 sm:p-10">
                <Quote className="w-10 h-10 text-zinc-600/40 mb-4" />
                
                {/* Active Review Slide */}
                {validReviews[currentIndex] && (
                  <div className="space-y-4">
                    {/* Star Rating & Verified Badge */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < validReviews[currentIndex].rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {validReviews[currentIndex].relativeTimeDescription || ''}
                      </span>
                    </div>

                    {/* Review Content */}
                    <p className="text-sm sm:text-base text-zinc-200 leading-relaxed italic">
                      &ldquo;{validReviews[currentIndex].text}&rdquo;
                    </p>

                    {/* Reviewer Details */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      {validReviews[currentIndex].authorPhotoUrl ? (
                        <img
                          src={validReviews[currentIndex].authorPhotoUrl}
                          alt={validReviews[currentIndex].authorName}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 text-zinc-200 font-bold flex items-center justify-center text-sm font-mono">
                          {validReviews[currentIndex].authorName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>{validReviews[currentIndex].authorName}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-[11px] text-zinc-400">Reseña verificada en Google</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              {validReviews.length > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={handlePrev}
                    aria-label="Reseña anterior"
                    className="p-2.5 rounded-xl bg-[#14141e] hover:bg-[#1e1e2d] border border-[#2a2a3e] text-zinc-300 hover:text-white cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {validReviews.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`Ir a la reseña ${idx + 1}`}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === currentIndex ? 'w-6 bg-red-600' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    aria-label="Siguiente reseña"
                    className="p-2.5 rounded-xl bg-[#14141e] hover:bg-[#1e1e2d] border border-[#2a2a3e] text-zinc-300 hover:text-white cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* External Google Actions */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <a
                href={reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="embossed-btn-red px-6 py-3 text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center gap-2 cursor-pointer"
              >
                <span>LEER RESEÑAS EN GOOGLE</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href={writeReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="embossed-btn-dark px-6 py-3 text-zinc-200 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-red-500" />
                <span>ESCRIBIR UNA RESEÑA</span>
              </a>
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* CASE 2: CLEAN ARCHITECTURAL PREPARED STATE                         */
          /* Prepared for live API connection without fabricated reviews        */
          /* =================================================================== */
          <div className="max-w-3xl mx-auto">
            <div className="embossed-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden">
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-white mb-3 embossed-text-3d">
                Valoraciones en Google
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed mb-6">
                Consulta las opiniones reales y valoraciones de los clientes de La Tentación Burger directamente en nuestro perfil oficial de Google, o déjanos tu propia reseña tras visitarnos.
              </p>

              {/* Status Note: Explaining verified connection point without fake reviews */}
              <div className="p-3.5 rounded-xl bg-[#12121c] border border-white/5 text-[11px] text-zinc-400 max-w-lg mx-auto mb-8 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Perfil verificado de Google Business · Barriada de San Diego, Sevilla</span>
              </div>

              {/* Actions with prominent "LEER RESEÑAS EN GOOGLE" */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <a
                  href={reviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="embossed-btn-red w-full sm:w-auto px-7 py-3.5 text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>LEER RESEÑAS EN GOOGLE</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <a
                  href={writeReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="embossed-btn-dark w-full sm:w-auto px-7 py-3.5 text-zinc-200 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-red-500" />
                  <span>ESCRIBIR UNA RESEÑA</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
