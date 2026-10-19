import type { GoogleReview } from '../data/restaurantInfo';

/**
 * Validates whether a GoogleReview object has the required genuine non-empty fields.
 */
export const isValidReview = (review: GoogleReview): boolean => {
  return (
    typeof review.id === 'string' &&
    review.id.trim() !== '' &&
    typeof review.authorName === 'string' &&
    review.authorName.trim() !== '' &&
    typeof review.rating === 'number' &&
    review.rating >= 1 &&
    review.rating <= 5 &&
    typeof review.text === 'string' &&
    review.text.trim() !== ''
  );
};

/**
 * Sorts genuine reviews by publish date descending (latest first) when dates are available.
 */
export const sortReviewsLatestFirst = (reviews: GoogleReview[]): GoogleReview[] => {
  return [...reviews].sort((a, b) => {
    if (a.publishTime && b.publishTime) {
      return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
    }
    return 0;
  });
};

/**
 * Returns stars configuration for rating display.
 */
export const getStarBreakdown = (rating: number): { full: number; empty: number } => {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return {
    full: clamped,
    empty: 5 - clamped,
  };
};
