import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight, one-time viewport entrance hook.
 * - Defaults to `true` if `IntersectionObserver` is unavailable or `prefers-reduced-motion: reduce` is enabled,
 *   so cards are NEVER left invisible or stuck off-screen.
 * - Triggers once as soon as the element approaches/enters the viewport (`rootMargin: '40px 0px'`, `threshold: 0.08`)
 *   and disconnects immediately afterward, so scrolling away and back never hides or re-animates the card.
 */
export function useViewportEntrance<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (typeof window.IntersectionObserver === 'undefined') return true;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (hasEntered) return;
    const node = ref.current;
    if (!node) {
      setHasEntered(true);
      return;
    }

    if (
      typeof window === 'undefined' ||
      typeof window.IntersectionObserver === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setHasEntered(true);
      return;
    }

    // Immediate bounding-rect check for cards already in or near the initial viewport
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight + 48 && rect.bottom > -48) {
      setHasEntered(true);
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setHasEntered(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        root: null,
        rootMargin: '48px 0px',
        threshold: 0.05,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [hasEntered]);

  return {
    ref,
    hasEntered,
    entranceClassName: hasEntered ? 'viewport-card-entered' : 'viewport-card-pending',
  };
}
