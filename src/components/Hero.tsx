import React, { useState, useRef, useEffect } from 'react';
import type { NavView } from './Navbar';

interface HeroProps {
  onNavigate: (view: NavView) => void;
  isActive?: boolean;
}

// Module-level playback state so even if Hero ever re-renders or remounts,
// playback position and completed final-frame state are preserved across the session.
const heroPlaybackMemory = {
  hasCompleted: false,
  currentTime: 0,
};

export const Hero: React.FC<HeroProps> = ({ onNavigate, isActive = true }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isActiveRef = useRef<boolean>(isActive);
  isActiveRef.current = isActive;
  const [isVideoEnded, setIsVideoEnded] = useState<boolean>(heroPlaybackMemory.hasCompleted);

  const handleReplayVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    heroPlaybackMemory.hasCompleted = false;
    heroPlaybackMemory.currentTime = 0;
    setIsVideoEnded(false);

    video.defaultMuted = true;
    video.muted = true;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.loop = false;

    const lockFinalFrame = () => {
      heroPlaybackMemory.hasCompleted = true;
      if (video.duration && isFinite(video.duration)) {
        heroPlaybackMemory.currentTime = video.duration;
      }
      if (!video.paused) {
        video.pause();
      }
      setIsVideoEnded(true);
    };

    const resumeIfEligible = () => {
      if (!video || !isActiveRef.current) return;
      if (heroPlaybackMemory.hasCompleted || video.ended) {
        setIsVideoEnded(true);
        return;
      }
      setIsVideoEnded(false);
      if (video.paused) {
        video.defaultMuted = true;
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay deferred until user interaction
          });
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (!video) return;
      if (heroPlaybackMemory.hasCompleted) {
        if (video.duration && isFinite(video.duration)) {
          video.currentTime = Math.max(0, video.duration - 0.03);
        }
        video.pause();
        setIsVideoEnded(true);
        return;
      }
      if (
        heroPlaybackMemory.currentTime > 0 &&
        Math.abs(video.currentTime - heroPlaybackMemory.currentTime) > 0.15
      ) {
        video.currentTime = heroPlaybackMemory.currentTime;
      }
      resumeIfEligible();
    };

    const handleTimeUpdate = () => {
      if (!video || heroPlaybackMemory.hasCompleted) return;
      if (video.currentTime > 0) {
        heroPlaybackMemory.currentTime = video.currentTime;
      }
      // Lock cleanly onto the final logo frame at the end of the video stream (10.20s–10.233s)
      if (video.duration && isFinite(video.duration) && video.duration - video.currentTime <= 0.035) {
        lockFinalFrame();
      }
    };

    const handleEnded = () => {
      lockFinalFrame();
    };

    const handlePlay = () => {
      if (!heroPlaybackMemory.hasCompleted) {
        setIsVideoEnded(false);
      }
    };

    const handleStalled = () => {
      if (!video || heroPlaybackMemory.hasCompleted || !isActiveRef.current) return;
      window.setTimeout(() => {
        if (
          video &&
          isActiveRef.current &&
          !heroPlaybackMemory.hasCompleted &&
          !video.ended &&
          video.paused
        ) {
          resumeIfEligible();
        }
      }, 150);
    };

    const handleUserInteraction = () => {
      if (!video || heroPlaybackMemory.hasCompleted || !isActiveRef.current) return;
      if (video.paused && !video.ended) {
        resumeIfEligible();
      }
    };

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      resumeIfEligible();
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', resumeIfEligible);
    video.addEventListener('play', handlePlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('stalled', handleStalled);
    document.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    document.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      if (video && !heroPlaybackMemory.hasCompleted && video.currentTime > 0) {
        heroPlaybackMemory.currentTime = video.currentTime;
      }
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', resumeIfEligible);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('stalled', handleStalled);
      document.removeEventListener('pointerdown', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Pause mid-playback when navigating away from Homepage, and resume from same position on return
  // (or keep final logo frame if already completed)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isActive) {
      if (!heroPlaybackMemory.hasCompleted && !video.paused && !video.ended) {
        if (video.currentTime > 0) {
          heroPlaybackMemory.currentTime = video.currentTime;
        }
        video.pause();
      }
      return;
    }

    // Returning to homepage
    if (heroPlaybackMemory.hasCompleted || video.ended) {
      if (!video.paused) {
        video.pause();
      }
      setIsVideoEnded(true);
      return;
    }

    if (
      heroPlaybackMemory.currentTime > 0 &&
      Math.abs(video.currentTime - heroPlaybackMemory.currentTime) > 0.15
    ) {
      video.currentTime = heroPlaybackMemory.currentTime;
    }

    if (video.paused) {
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [isActive]);

  return (
    <section className="relative bg-transparent pt-0 pb-3 sm:pb-4">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* =================================================================== */}
        {/* 1. FIRST: THE PRESENTATION VIDEO AT THE VERY TOP                    */}
        {/* Blended naturally into the black background with no borders/frames  */}
        {/* Plays once and preserves the final La Tentación Burger logo frame   */}
        {/* =================================================================== */}
        <div className="w-full max-w-4xl mx-auto mb-3 sm:mb-4">
          <div className="relative w-full aspect-video min-h-[200px] sm:min-h-[380px] bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop={false}
              playsInline
              controls={false}
              disablePictureInPicture
              preload="auto"
              className="w-full h-full object-cover object-center bg-black block"
              aria-label="Vídeo oficial de presentación de La Tentación Burger"
            >
              <source src="/hero-burger.mp4" type="video/mp4" />
            </video>

            {/* Small, discreet corner ▶ replay button visible ONLY after the video finishes */}
            {isVideoEnded && (
              <button
                type="button"
                onClick={handleReplayVideo}
                aria-label="Reproducir de nuevo el vídeo de presentación"
                data-testid="hero-video-replay-btn"
                className="absolute bottom-2.5 right-2.5 sm:bottom-3.5 sm:right-3.5 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/75 hover:bg-black/95 border border-white/20 hover:border-red-500/70 text-zinc-200 hover:text-white transition-all cursor-pointer shadow-md"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="w-3.5 h-3.5 fill-current translate-x-[1px]"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="sr-only">▶</span>
              </button>
            )}

            {/* Smooth edge vignette transitions into the black website background */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-10 sm:h-14 bg-gradient-to-b from-black via-black/40 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12 sm:h-16 bg-gradient-to-t from-black via-black/50 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-14 bg-gradient-to-r from-black to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-14 bg-gradient-to-l from-black to-transparent"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. BRAND PHRASE IMMEDIATELY BELOW VIDEO                             */}
        {/* Solid corporate red matching "BURGER" in the fixed top header       */}
        {/* =================================================================== */}
        <div className="w-full max-w-3xl mx-auto mb-4 sm:mb-5">
          <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight uppercase text-red-600 leading-snug">
            Caer en la tentación nunca fue un pecado
          </p>
        </div>

        {/* =================================================================== */}
        {/* 3. MAIN NAVIGATION BUTTONS: MENÚ | RESERVAS | DOMICILIO             */}
        {/* =================================================================== */}
        <div className="w-full max-w-md mx-auto mb-1">
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
            <button
              onClick={() => onNavigate('menu')}
              aria-label="Ir a la sección de Menú"
              className="embossed-btn-red inline-flex items-center justify-center py-3 sm:py-3.5 px-2 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white rounded-xl cursor-pointer text-center"
            >
              MENÚ
            </button>

            <button
              onClick={() => onNavigate('reservas')}
              aria-label="Ir a la sección de Reservas"
              className="embossed-btn-dark inline-flex items-center justify-center py-3 sm:py-3.5 px-2 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-100 rounded-xl cursor-pointer text-center"
            >
              RESERVAS
            </button>

            <button
              onClick={() => onNavigate('delivery')}
              aria-label="Ir a la sección de Domicilio"
              className="embossed-btn-dark inline-flex items-center justify-center py-3 sm:py-3.5 px-2 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-100 rounded-xl cursor-pointer text-center"
            >
              DOMICILIO
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
