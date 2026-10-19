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
  const [pressedNav, setPressedNav] = useState<NavView | null>(null);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (navTimerRef.current !== null) {
        window.clearTimeout(navTimerRef.current);
      }
    };
  }, []);

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

  // When the original video finishes, clicking or tapping directly on the video restarts it from the beginning
  const handleVideoSurfaceTap = () => {
    const video = videoRef.current;
    if (!video) return;
    if (heroPlaybackMemory.hasCompleted || video.ended || isVideoEnded) {
      handleReplayVideo();
    }
  };

  const handleHeroNavClick = (view: NavView) => {
    setPressedNav(view);
    if (navTimerRef.current !== null) {
      window.clearTimeout(navTimerRef.current);
    }
    navTimerRef.current = window.setTimeout(() => {
      onNavigate(view);
      window.setTimeout(() => {
        setPressedNav((prev) => (prev === view ? null : prev));
      }, 140);
    }, 85);
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

  const getHeroNavBtnClass = (view: NavView) => {
    const isPressed = pressedNav === view;
    return `${
      isPressed ? 'embossed-btn-red text-white' : 'embossed-btn-dark text-red-500 hover:text-red-400 active:bg-red-600 active:text-white'
    } inline-flex items-center justify-center py-3 sm:py-3.5 px-2 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl cursor-pointer text-center transition-colors duration-100`;
  };

  return (
    <section className="relative bg-transparent pt-0 pb-2 sm:pb-3">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* =================================================================== */}
        {/* 1. FIRST: THE PRESENTATION VIDEO AT THE VERY TOP                    */}
        {/* Blended naturally into the black background with no borders/frames  */}
        {/* Plays once; tapping directly on the finished video restarts it      */}
        {/* =================================================================== */}
        <div className="w-full max-w-4xl mx-auto mb-2.5 sm:mb-3">
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
              onClick={handleVideoSurfaceTap}
              data-video-ended={isVideoEnded ? 'true' : 'false'}
              className={`w-full h-full object-cover object-center bg-black block ${
                isVideoEnded ? 'cursor-pointer' : ''
              }`}
              aria-label="Vídeo oficial de presentación de La Tentación Burger"
            >
              <source src="/hero-burger.mp4" type="video/mp4" />
            </video>

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
        <div className="w-full max-w-3xl mx-auto mb-3 sm:mb-3.5">
          <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight uppercase text-red-600 leading-snug">
            Caer en la tentación nunca fue un pecado
          </p>
        </div>

        {/* =================================================================== */}
        {/* 3. MAIN NAVIGATION BUTTONS: MENÚ | RESERVAS | DOMICILIO             */}
        {/* Consistent red styling; flashes brand red when clicked              */}
        {/* =================================================================== */}
        <div className="w-full max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
            <button
              type="button"
              onPointerDown={() => setPressedNav('menu')}
              onClick={() => handleHeroNavClick('menu')}
              aria-label="Ir a la sección de Menú"
              data-testid="hero-nav-menu"
              data-pressed={pressedNav === 'menu' ? 'true' : 'false'}
              className={getHeroNavBtnClass('menu')}
            >
              MENÚ
            </button>

            <button
              type="button"
              onPointerDown={() => setPressedNav('reservas')}
              onClick={() => handleHeroNavClick('reservas')}
              aria-label="Ir a la sección de Reservas"
              data-testid="hero-nav-reservas"
              data-pressed={pressedNav === 'reservas' ? 'true' : 'false'}
              className={getHeroNavBtnClass('reservas')}
            >
              RESERVAS
            </button>

            <button
              type="button"
              onPointerDown={() => setPressedNav('delivery')}
              onClick={() => handleHeroNavClick('delivery')}
              aria-label="Ir a la sección de Domicilio"
              data-testid="hero-nav-delivery"
              data-pressed={pressedNav === 'delivery' ? 'true' : 'false'}
              className={getHeroNavBtnClass('delivery')}
            >
              DOMICILIO
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
