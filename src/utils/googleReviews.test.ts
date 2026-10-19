import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidReview, sortReviewsLatestFirst, getStarBreakdown } from './googleReviews.ts';
import type { GoogleReview } from '../data/restaurantInfo.ts';

test('isValidReview correctly validates complete and incomplete review objects', () => {
  const valid: GoogleReview = {
    id: 'rev-1',
    authorName: 'Carlos M.',
    rating: 5,
    text: 'Las mejores smash de Sevilla, patatas caseras increíbles.',
  };
  assert.equal(isValidReview(valid), true);

  const invalidName: GoogleReview = {
    id: 'rev-2',
    authorName: '',
    rating: 4,
    text: 'Muy ricas',
  };
  assert.equal(isValidReview(invalidName), false);

  const invalidRating: GoogleReview = {
    id: 'rev-3',
    authorName: 'Ana',
    rating: 6,
    text: 'Genial',
  };
  assert.equal(isValidReview(invalidRating), false);
});

test('sortReviewsLatestFirst orders reviews by publication date descending', () => {
  const reviews: GoogleReview[] = [
    {
      id: '1',
      authorName: 'A',
      rating: 5,
      text: 'Bueno',
      publishTime: '2025-01-10T12:00:00Z',
    },
    {
      id: '2',
      authorName: 'B',
      rating: 5,
      text: 'Excelente',
      publishTime: '2025-06-20T12:00:00Z',
    },
    {
      id: '3',
      authorName: 'C',
      rating: 4,
      text: 'Recomendado',
      publishTime: '2025-03-01T12:00:00Z',
    },
  ];

  const sorted = sortReviewsLatestFirst(reviews);
  assert.equal(sorted[0].id, '2');
  assert.equal(sorted[1].id, '3');
  assert.equal(sorted[2].id, '1');
});

test('getStarBreakdown calculates full and empty stars within range 0-5', () => {
  assert.deepEqual(getStarBreakdown(5), { full: 5, empty: 0 });
  assert.deepEqual(getStarBreakdown(3.7), { full: 4, empty: 1 });
  assert.deepEqual(getStarBreakdown(1), { full: 1, empty: 4 });
});
