import React, { useState, useEffect, useRef } from 'react';

interface AmbientFlamesProps {
  variant?: 'default' | 'compact';
}

type BurstZone = 'left' | 'center' | 'right';

interface OrganicFlameBurst {
  id: number;
  zone: BurstZone;
  leftPercent: number;
  heightPercent: number;
  widthPx: number;
  durationMs: number;
  intensity: number;
  mirror: boolean;
  swayDeg: number;
  variantIndex: number;
}

/**
 * Reference-2 style broad, spreading, organic multi-tongue flame SVG paths (viewBox 0 0 360 320).
 * Each variant has a wide base, spreading left/right plumes, dynamic mid-tongues, inner hot core,
 * and detached upper flame wisps for a natural, realistic fire spread.
 */
const SPREADING_FLAME_VARIANTS = [
  {
    outerMantle:
      'M180 320 C95 316, 36 274, 24 212 C16 172, 38 134, 22 92 C48 118, 68 96, 64 52 C88 86, 114 70, 118 28 C138 66, 158 46, 176 6 C198 48, 220 68, 236 24 C246 72, 274 88, 296 48 C290 94, 314 118, 338 88 C324 134, 344 174, 332 216 C316 276, 262 316, 180 320 Z',
    leftSpreadingWing:
      'M126 320 C72 304, 30 258, 18 196 C10 154, 28 114, 14 74 C40 102, 58 84, 56 44 C78 82, 102 112, 92 158 C112 142, 122 184, 110 228 C124 264, 136 296, 126 320 Z',
    rightSpreadingWing:
      'M234 320 C288 304, 330 258, 342 196 C350 154, 332 114, 346 74 C320 102, 302 84, 304 44 C282 82, 258 112, 268 158 C248 142, 238 184, 250 228 C236 264, 224 296, 234 320 Z',
    midPlume:
      'M180 320 C118 310, 74 268, 68 208 C64 166, 86 128, 76 86 C98 114, 120 92, 124 48 C144 84, 162 64, 178 24 C196 66, 216 86, 234 46 C240 92, 262 112, 284 82 C274 128, 296 168, 290 212 C282 270, 240 310, 180 320 Z',
    innerCore:
      'M180 320 C138 312, 108 278, 106 232 C104 196, 122 162, 118 126 C136 152, 152 132, 160 94 C172 126, 184 108, 192 78 C202 114, 218 138, 232 112 C228 152, 248 186, 246 226 C244 274, 218 312, 180 320 Z',
    hotHeart:
      'M180 320 C154 314, 136 290, 138 256 C140 226, 154 202, 152 174 C164 196, 174 180, 180 152 C188 182, 200 198, 210 176 C206 206, 220 232, 218 260 C216 292, 202 314, 180 320 Z',
    wispLeft:
      'M74 134 C52 102, 58 64, 82 32 C74 68, 92 98, 74 134 Z',
    wispCenter:
      'M176 74 C162 44, 170 18, 186 2 C180 30, 194 52, 176 74 Z',
    wispRight:
      'M286 138 C308 106, 302 66, 278 36 C286 72, 268 102, 286 138 Z',
  },
  {
    outerMantle:
      'M180 320 C88 314, 28 268, 18 204 C12 162, 36 122, 18 78 C46 108, 72 86, 70 42 C96 80, 124 62, 132 18 C154 58, 172 38, 188 4 C208 46, 230 66, 248 22 C256 70, 284 86, 308 44 C300 92, 324 116, 344 84 C328 132, 348 176, 336 218 C320 278, 266 314, 180 320 Z',
    leftSpreadingWing:
      'M132 320 C76 302, 34 252, 20 188 C12 146, 32 108, 18 68 C44 98, 64 78, 62 38 C84 78, 108 108, 98 154 C118 138, 128 180, 116 224 C130 262, 142 294, 132 320 Z',
    rightSpreadingWing:
      'M228 320 C284 302, 326 252, 340 188 C348 146, 328 108, 342 68 C316 98, 296 78, 298 38 C276 78, 252 108, 262 154 C242 138, 232 180, 244 224 C230 262, 218 294, 228 320 Z',
    midPlume:
      'M180 320 C114 308, 68 262, 64 202 C60 158, 84 120, 72 78 C96 108, 122 86, 128 42 C148 80, 168 58, 184 20 C202 62, 224 82, 242 42 C246 88, 268 108, 290 78 C278 124, 300 164, 292 208 C284 268, 242 308, 180 320 Z',
    innerCore:
      'M180 320 C134 310, 104 274, 102 226 C100 190, 120 156, 114 118 C134 146, 154 126, 164 88 C176 122, 190 102, 198 72 C208 110, 224 134, 238 108 C232 148, 252 182, 250 222 C248 272, 220 310, 180 320 Z',
    hotHeart:
      'M180 320 C152 314, 134 288, 136 252 C138 222, 152 198, 150 168 C162 192, 174 176, 182 148 C190 178, 202 194, 212 172 C208 202, 222 228, 220 258 C218 290, 204 314, 180 320 Z',
    wispLeft:
      'M68 126 C46 94, 54 56, 78 24 C68 62, 86 92, 68 126 Z',
    wispCenter:
      'M184 68 C170 38, 178 14, 194 0 C188 28, 200 48, 184 68 Z',
    wispRight:
      'M292 130 C314 98, 306 58, 282 28 C292 66, 274 96, 292 130 Z',
  },
];

interface EmberConfig {
  id: number;
  left: string;
  bottom: string;
  sizeClass: string;
  trajectoryClass: string;
  duration: string;
  delay: string;
  driftX: string;
}

/**
 * Increased set of 18 organic glowing embers rising from the bottom fire area
 * with varied sizes, horizontal drifts, durations, delays, and rise heights.
 */
const EMBER_PARTICLES: EmberConfig[] = [
  { id: 1, left: '7%', bottom: '8px', sizeClass: 'ember-spark--xs', trajectoryClass: 'ember-spark--low', duration: '9.4s', delay: '0.3s', driftX: '14px' },
  { id: 2, left: '12%', bottom: '14px', sizeClass: 'ember-spark--sm', trajectoryClass: 'ember-spark--mid', duration: '12.8s', delay: '2.1s', driftX: '-18px' },
  { id: 3, left: '17%', bottom: '6px', sizeClass: 'ember-spark--md', trajectoryClass: 'ember-spark--high', duration: '16.2s', delay: '0.8s', driftX: '24px' },
  { id: 4, left: '22%', bottom: '18px', sizeClass: 'ember-spark--xs', trajectoryClass: 'ember-spark--low', duration: '10.6s', delay: '4.5s', driftX: '-12px' },
  { id: 5, left: '27%', bottom: '10px', sizeClass: 'ember-spark--sm', trajectoryClass: 'ember-spark--mid', duration: '13.5s', delay: '1.7s', driftX: '19px' },
  { id: 6, left: '33%', bottom: '12px', sizeClass: 'ember-spark--md', trajectoryClass: 'ember-spark--high', duration: '17.4s', delay: '5.9s', driftX: '-26px' },
  { id: 7, left: '38%', bottom: '8px', sizeClass: 'ember-spark--xs', trajectoryClass: 'ember-spark--low', duration: '8.9s', delay: '3.2s', driftX: '11px' },
  { id: 8, left: '43%', bottom: '16px', sizeClass: 'ember-spark--sm', trajectoryClass: 'ember-spark--mid', duration: '14.1s', delay: '0.5s', driftX: '-15px' },
  { id: 9, left: '48%', bottom: '10px', sizeClass: 'ember-spark--md', trajectoryClass: 'ember-spark--high', duration: '18.3s', delay: '7.1s', driftX: '22px' },
  { id: 10, left: '53%', bottom: '14px', sizeClass: 'ember-spark--xs', trajectoryClass: 'ember-spark--low', duration: '9.8s', delay: '2.6s', driftX: '-14px' },
  { id: 11, left: '58%', bottom: '7px', sizeClass: 'ember-spark--sm', trajectoryClass: 'ember-spark--mid', duration: '11.9s', delay: '4.9s', driftX: '16px' },
  { id: 12, left: '63%', bottom: '15px', sizeClass: 'ember-spark--xs', trajectoryClass: 'ember-spark--low', duration: '10.2s', delay: '1.1s', driftX: '-10px' },
  { id: 13, left: '68%', bottom: '9px', sizeClass: 'ember-spark--md', trajectoryClass: 'ember-spark--high', duration: '15.7s', delay: '3.8s', driftX: '-21px' },
  { id: 14, left: '73%', bottom: '12px', sizeClass: 'ember-spark--sm', trajectoryClass: 'ember-spark--mid', duration: '13.2s', delay: '6.4s', driftX: '17px' },
  { id: 15, left: '78%', bottom: '8px', sizeClass: 'ember-spark--xs', trajectoryClass: 'ember-spark--low', duration: '9.1s', delay: '2.9s', driftX: '-13px' },
  { id: 16, left: '83%', bottom: '16px', sizeClass: 'ember-spark--md', trajectoryClass: 'ember-spark--high', duration: '16.9s', delay: '1.4s', driftX: '25px' },
  { id: 17, left: '88%', bottom: '11px', sizeClass: 'ember-spark--sm', trajectoryClass: 'ember-spark--mid', duration: '12.4s', delay: '5.2s', driftX: '-19px' },
  { id: 18, left: '93%', bottom: '9px', sizeClass: 'ember-spark--xs', trajectoryClass: 'ember-spark--low', duration: '10.8s', delay: '3.7s', driftX: '-11px' },
];

const ZONE_CENTERS: Record<BurstZone, number> = {
  left: 22,
  center: 50,
  right: 78,
};

/**
 * Refined Fire & Ember Background:
 * 1. Baseline fire: Most of the time, only a very small, subtle flame and warm hearth glow
 *    is visible right at the very bottom edge of the page.
 * 2. Occasional flame bursts: One larger, broad, spreading organic flame burst (reference-2 style)
 *    emerges occasionally from left, center, or right at the bottom, accompanied by a soft,
 *    brief warm illumination that fades smoothly back to the tiny baseline flame.
 *    Long, irregular quiet intervals separate major bursts; never more than one burst at a time.
 * 3. Embers: 18 glowing embers of varied sizes and trajectories drifting upward from the bottom.
 */
export const AmbientFlames: React.FC<AmbientFlamesProps> = () => {
  const [activeBurst, setActiveBurst] = useState<OrganicFlameBurst | null>(null);
  const lastZoneRef = useRef<BurstZone>('right');
  const burstCounterRef = useRef<number>(0);

  useEffect(() => {
    let quietTimer: number | undefined;
    let clearBurstTimer: number | undefined;

    const pickNextZone = (prevZone: BurstZone): BurstZone => {
      const allZones: BurstZone[] = ['left', 'center', 'right'];
      const candidates = allZones.filter((z) => z !== prevZone);
      // Slight natural randomness while avoiding mechanical repetition
      if (Math.random() < 0.82) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
      return allZones[Math.floor(Math.random() * allZones.length)];
    };

    const createNextBurst = (): OrganicFlameBurst => {
      burstCounterRef.current += 1;
      const zone = pickNextZone(lastZoneRef.current);
      lastZoneRef.current = zone;

      const baseCenter = ZONE_CENTERS[zone];
      const jitter = Math.floor((Math.random() - 0.5) * 14); // -7% to +7%
      const leftPercent = Math.max(15, Math.min(85, baseCenter + jitter));
      const heightPercent = 40 + Math.floor(Math.random() * 12); // 40% to 51% of main height
      const widthPx = 330 + Math.floor(Math.random() * 130); // Broad, spreading 330px–460px plume
      const durationMs = 4100 + Math.floor(Math.random() * 1200); // 4.1s–5.3s smooth rise & fade
      const intensity = Number((0.42 + Math.random() * 0.14).toFixed(2));
      const mirror = Math.random() > 0.5;
      const swayDeg = Math.floor(Math.random() * 7) - 3;
      const variantIndex = Math.floor(Math.random() * SPREADING_FLAME_VARIANTS.length);

      return {
        id: burstCounterRef.current,
        zone,
        leftPercent,
        heightPercent,
        widthPx,
        durationMs,
        intensity,
        mirror,
        swayDeg,
        variantIndex,
      };
    };

    // Unpredictable, non-mechanical quiet interval generator (18s to 37s between bursts)
    const getIrregularQuietDelayMs = () => {
      const base = 18000;
      const waveA = Math.random() * 11000;
      const waveB = Math.random() * 8000;
      return Math.round(base + waveA + waveB);
    };

    const triggerBurstCycle = (delayMs: number) => {
      quietTimer = window.setTimeout(() => {
        const nextBurst = createNextBurst();
        setActiveBurst(nextBurst);

        // Once the burst finishes rising, spreading, and fading out, return strictly to the tiny baseline flame
        clearBurstTimer = window.setTimeout(() => {
          setActiveBurst(null);
          triggerBurstCycle(getIrregularQuietDelayMs());
        }, nextBurst.durationMs);
      }, delayMs);
    };

    // Start in the quiet baseline state, then trigger the first occasional burst after an irregular initial quiet pause
    const initialQuietDelay = 6500 + Math.floor(Math.random() * 5500);
    triggerBurstCycle(initialQuietDelay);

    return () => {
      if (quietTimer !== undefined) window.clearTimeout(quietTimer);
      if (clearBurstTimer !== undefined) window.clearTimeout(clearBurstTimer);
    };
  }, []);

  const burstPaths = activeBurst
    ? SPREADING_FLAME_VARIANTS[activeBurst.variantIndex] || SPREADING_FLAME_VARIANTS[0]
    : null;

  return (
    <div
      className="pointer-events-none select-none absolute inset-0 overflow-hidden z-0"
      aria-hidden="true"
      data-testid="ambient-flames-container"
      data-burst-active={activeBurst ? 'true' : 'false'}
      data-burst-zone={activeBurst ? activeBurst.zone : 'baseline'}
    >
      {/* =================================================================== */}
      {/* 1. TINY BASELINE FIRE AT THE VERY BOTTOM OF THE PAGE                */}
      {/* Very small, subtle warm glow and low miniature flame tongues        */}
      {/* =================================================================== */}
      <div className="baseline-hearth-glow baseline-hearth-glow--left" />
      <div className="baseline-hearth-glow baseline-hearth-glow--center" />
      <div className="baseline-hearth-glow baseline-hearth-glow--right" />

      <svg
        viewBox="0 0 1200 44"
        preserveAspectRatio="none"
        className="baseline-flame-strip"
      >
        <defs>
          <linearGradient id="baseline-flame-grad" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#991b1b" stopOpacity="0.52" />
            <stop offset="48%" stopColor="#dc2626" stopOpacity="0.28" />
            <stop offset="85%" stopColor="#ea580c" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="baseline-core-grad" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#fb923c" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Tiny, low-profile flickering baseline tongues along the very bottom edge */}
        <path
          d="M0 44 L0 36 Q35 24 70 37 T145 28 T220 38 T305 22 T390 37 T475 29 T560 38 T645 20 T730 36 T815 27 T900 37 T985 23 T1070 36 T1145 29 L1200 38 L1200 44 Z"
          fill="url(#baseline-flame-grad)"
          className="baseline-flame-wave"
        />
        <path
          d="M60 44 Q115 32 170 40 T295 28 T420 41 T555 30 T680 39 T810 27 T945 40 T1080 31 L1140 44 Z"
          fill="url(#baseline-core-grad)"
          className="baseline-flame-wave baseline-flame-wave--alt"
        />
      </svg>

      {/* =================================================================== */}
      {/* 2. OCCASIONAL LARGE, BROAD, SPREADING FLAME BURST (ONE AT A TIME)   */}
      {/* With soft, brief warm illumination around the burst origin          */}
      {/* =================================================================== */}
      {activeBurst && burstPaths && (
        <React.Fragment key={activeBurst.id}>
          {/* Soft, brief warm illumination around the burst origin, fading smoothly */}
          <div
            style={{
              left: `${activeBurst.leftPercent}%`,
              animationDuration: `${activeBurst.durationMs}ms`,
              ['--burst-glow-opacity' as string]: Number((activeBurst.intensity * 0.52).toFixed(2)),
            }}
            className="burst-warm-illumination"
          />

          {/* Broad, spreading multi-tongue organic flame burst */}
          <div
            style={{
              left: `${activeBurst.leftPercent}%`,
              height: `clamp(320px, ${activeBurst.heightPercent}%, 760px)`,
              width: `${activeBurst.widthPx}px`,
              animationDuration: `${activeBurst.durationMs}ms`,
              ['--flame-peak-opacity' as string]: activeBurst.intensity,
              ['--flame-sway' as string]: `${activeBurst.swayDeg}deg`,
              ['--flame-flip' as string]: activeBurst.mirror ? '-1' : '1',
            }}
            className="organic-flame-plume"
          >
            <svg
              viewBox="0 0 360 320"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="doc-flame-outer" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.86" />
                  <stop offset="28%" stopColor="#b91c1c" stopOpacity="0.72" />
                  <stop offset="58%" stopColor="#dc2626" stopOpacity="0.46" />
                  <stop offset="84%" stopColor="#ea580c" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="doc-flame-wing" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#991b1b" stopOpacity="0.78" />
                  <stop offset="40%" stopColor="#dc2626" stopOpacity="0.54" />
                  <stop offset="76%" stopColor="#f97316" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="doc-flame-mid" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.88" />
                  <stop offset="38%" stopColor="#ea580c" stopOpacity="0.68" />
                  <stop offset="74%" stopColor="#fb923c" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="doc-flame-core" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                  <stop offset="48%" stopColor="#facc15" stopOpacity="0.64" />
                  <stop offset="86%" stopColor="#fef08a" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d={burstPaths.outerMantle}
                fill="url(#doc-flame-outer)"
                className="organic-flame-tongue-outer"
              />
              <path
                d={burstPaths.leftSpreadingWing}
                fill="url(#doc-flame-wing)"
                className="organic-flame-wing-left"
              />
              <path
                d={burstPaths.rightSpreadingWing}
                fill="url(#doc-flame-wing)"
                className="organic-flame-wing-right"
              />
              <path
                d={burstPaths.wispLeft}
                fill="url(#doc-flame-mid)"
                className="organic-flame-wisp"
              />
              <path
                d={burstPaths.wispRight}
                fill="url(#doc-flame-mid)"
                className="organic-flame-wisp organic-flame-wisp--delayed"
              />
              <path
                d={burstPaths.wispCenter}
                fill="url(#doc-flame-core)"
                className="organic-flame-wisp"
              />
              <path
                d={burstPaths.midPlume}
                fill="url(#doc-flame-mid)"
                className="organic-flame-tongue-mid"
              />
              <path
                d={burstPaths.innerCore}
                fill="url(#doc-flame-core)"
                className="organic-flame-tongue-core"
              />
              <path
                d={burstPaths.hotHeart}
                fill="url(#doc-flame-core)"
                className="organic-flame-tongue-heart"
              />
            </svg>
          </div>
        </React.Fragment>
      )}

      {/* =================================================================== */}
      {/* 3. INCREASED ORGANIC GLOWING EMBERS DRIFTING UPWARD                 */}
      {/* =================================================================== */}
      {EMBER_PARTICLES.map((ember) => (
        <span
          key={ember.id}
          style={{
            left: ember.left,
            bottom: ember.bottom,
            animationDuration: ember.duration,
            animationDelay: ember.delay,
            ['--ember-drift-x' as string]: ember.driftX,
          }}
          className={`ember-spark-particle ${ember.sizeClass} ${ember.trajectoryClass}`}
        />
      ))}
    </div>
  );
};
