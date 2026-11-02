import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Release, releases, SPOTIFY_ARTIST_URL } from '../data/releases.ts';

export const AlbumCarousel: React.FC = () => {
  const total = releases.length;

  // Continuous visual progress for buttery 60 FPS physics
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; time: number; moved: boolean; startProgress: number }>({
    x: 0,
    time: 0,
    moved: false,
    startProgress: 0,
  });
  const lastWheelTimeRef = useRef(0);

  // Smooth continuous animation loop
  useEffect(() => {
    let rafId: number;

    const animate = () => {
      if (!isDragging) {
        const diff = targetProgressRef.current - progressRef.current;
        if (Math.abs(diff) > 0.0005) {
          progressRef.current += diff * 0.11;
          setProgress(progressRef.current);
        } else if (progressRef.current !== targetProgressRef.current) {
          progressRef.current = targetProgressRef.current;
          setProgress(targetProgressRef.current);
        }
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isDragging]);

  const goToNext = useCallback(() => {
    targetProgressRef.current = Math.round(targetProgressRef.current) + 1;
  }, []);

  const goToPrev = useCallback(() => {
    targetProgressRef.current = Math.round(targetProgressRef.current) - 1;
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext]);

  // Mouse wheel swiping with smooth physics accumulation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = performance.now();
      if (now - lastWheelTimeRef.current < 200) {
        return;
      }

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      if (Math.abs(delta) > 8) {
        const direction = delta > 0 ? 1 : -1;
        targetProgressRef.current = Math.round(targetProgressRef.current) + direction;
        lastWheelTimeRef.current = now;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Pointer drag handling (mouse + touch)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    dragStartRef.current = {
      x: e.clientX,
      time: performance.now(),
      moved: false,
      startProgress: targetProgressRef.current,
    };
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    // Generous threshold so genuine clicks aren't cancelled by minor mouse jitter
    if (Math.abs(deltaX) > 12) {
      dragStartRef.current.moved = true;
    }

    const approxCardWidth = 320;
    const progressDelta = -deltaX / approxCardWidth;
    const newProgress = dragStartRef.current.startProgress + progressDelta;

    targetProgressRef.current = newProgress;
    progressRef.current = newProgress;
    setProgress(newProgress);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaTime = performance.now() - dragStartRef.current.time;
    const velocity = deltaX / Math.max(deltaTime, 1);

    let finalTarget = Math.round(targetProgressRef.current);
    if (velocity < -0.35) {
      finalTarget = Math.ceil(targetProgressRef.current);
    } else if (velocity > 0.35) {
      finalTarget = Math.floor(targetProgressRef.current);
    }

    targetProgressRef.current = finalTarget;
  };

  const handleSideCardClick = (e: React.MouseEvent, relOffset: number) => {
    if (dragStartRef.current.moved) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();

    if (relOffset < 0) {
      targetProgressRef.current = Math.round(targetProgressRef.current) - 1;
    } else if (relOffset > 0) {
      targetProgressRef.current = Math.round(targetProgressRef.current) + 1;
    }
  };

  const baseIndex = Math.floor(progress);
  const frac = progress - baseIndex;
  const slots = [-2, -1, 0, 1, 2];

  const activeReleaseIndex = ((Math.round(progress) % total) + total) % total;
  const currentRelease = releases[activeReleaseIndex];

  return (
    <div className="relative z-10 flex flex-col items-center justify-center w-full h-full max-h-screen select-none overflow-hidden">
      {/* 3D Carousel Stage */}
      <div
        ref={containerRef}
        className="relative w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-x"
        style={{
          perspective: '1200px',
          perspectiveOrigin: 'center center',
          height: 'clamp(270px, 28vw, 380px)',
          maxWidth: '100vw',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="relative flex items-center justify-center"
          style={{
            // Authentic 1:1 SQUARE album cover dimensions
            width: 'clamp(230px, 24vw, 340px)',
            height: 'clamp(230px, 24vw, 340px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {slots.map((slot) => {
            const rawIndex = baseIndex + slot;
            const itemIndex = ((rawIndex % total) + total) % total;
            const release = releases[itemIndex];
            const relOffset = slot - frac;

            // Geometry:
            // 1. Spacing: 105% ensures clean cohesive separation between square covers
            const xPercent = relOffset * 105;

            // 2. Center card full size (scale 1.0), side covers smaller (scale 0.74)
            const absOffset = Math.abs(relOffset);
            const scale = Math.max(0.68, 1 - absOffset * 0.26);

            // 3. 3D perspective rotation
            const rotateY = -Math.sign(relOffset) * Math.min(22, absOffset * 14);

            // 4. Z-index & opacity
            const zIndex = Math.round(30 - absOffset * 10);
            let opacity = 1;
            if (absOffset > 1.25) {
              opacity = Math.max(0, 1 - (absOffset - 1.25) * 1.8);
            }

            const isCenter = absOffset < 0.45;

            return (
              <div
                key={`slot-${slot}-${release.id}`}
                className="absolute top-0 left-0 w-full h-full aspect-square"
                style={{
                  transform: `translateX(${xPercent}%) scale(${scale}) rotateY(${rotateY}deg)`,
                  zIndex,
                  opacity,
                  transformOrigin: 'center center',
                  backfaceVisibility: 'hidden',
                  willChange: 'transform, opacity',
                  cursor: isCenter ? 'pointer' : 'pointer',
                }}
              >
                {/* Dedicated Ground Contact Shadow underneath every square cover */}
                <div
                  className="absolute -bottom-6 left-[6%] w-[88%] h-6 rounded-[50%] pointer-events-none transition-opacity duration-300"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.26) 0%, rgba(0, 0, 0, 0.11) 45%, rgba(0, 0, 0, 0) 72%)',
                    filter: 'blur(7px)',
                    opacity: isCenter ? 0.95 : 0.8,
                  }}
                />

                {/* Cover container:
                    For central cover: native <a> link directly opening the release URL in a new tab!
                    For side covers: click listener smoothly shifting them to center. */}
                {isCenter ? (
                  <a
                    href={release.spotifyUrl || SPOTIFY_ARTIST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (dragStartRef.current.moved) {
                        e.preventDefault();
                      }
                    }}
                    title={`Listen to ${release.title} on Spotify`}
                    className="w-full h-full aspect-square rounded-[10px] md:rounded-[12px] overflow-hidden relative block group focus:outline-none cursor-pointer"
                    style={{
                      boxShadow:
                        '0 24px 52px -10px rgba(0, 0, 0, 0.26), 0 8px 18px -4px rgba(0, 0, 0, 0.14)',
                    }}
                  >
                    {/* Full 1:1 original square album artwork */}
                    <img
                      src={release.artwork}
                      alt={release.title}
                      draggable={false}
                      className="w-full h-full object-cover object-center select-none"
                      loading={absOffset <= 1 ? 'eager' : 'lazy'}
                    />

                    {/* Subtle hover sheen on center album */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-25 group-hover:opacity-45 transition-opacity duration-300"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 55%)',
                      }}
                    />
                  </a>
                ) : (
                  <div
                    onClick={(e) => handleSideCardClick(e, relOffset)}
                    title={release.title}
                    className="w-full h-full aspect-square rounded-[10px] md:rounded-[12px] overflow-hidden relative cursor-pointer"
                    style={{
                      boxShadow:
                        '0 18px 42px -8px rgba(0, 0, 0, 0.22), 0 6px 16px -3px rgba(0, 0, 0, 0.12)',
                    }}
                  >
                    <img
                      src={release.artwork}
                      alt={release.title}
                      draggable={false}
                      className="w-full h-full object-cover object-center select-none pointer-events-none"
                      loading={absOffset <= 1 ? 'eager' : 'lazy'}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Release Information with white halo shadow protection against floating trollfaces */}
      <div
        key={currentRelease.id}
        className="mt-6 sm:mt-7 flex flex-col items-center justify-center text-center select-none transition-all duration-300 ease-out animate-fadeIn relative z-20"
      >
        <a
          href={currentRelease.spotifyUrl || SPOTIFY_ARTIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="group relative block focus:outline-none px-6 py-2 rounded-full cursor-pointer"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.85) 60%, rgba(255, 255, 255, 0) 85%)',
          }}
        >
          <h1
            className="text-[19px] sm:text-[22px] font-normal tracking-[-0.015em] text-[#0a0a0a] group-hover:text-black transition-colors leading-tight"
            style={{
              textShadow:
                '0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff, 0 0 40px #ffffff, 1px 1px 2px #ffffff, -1px -1px 2px #ffffff, 1px -1px 2px #ffffff, -1px 1px 2px #ffffff',
            }}
          >
            {currentRelease.title}
          </h1>
          <p
            className="text-[12px] sm:text-[13px] font-normal tracking-[0.01em] text-[#737373] group-hover:text-[#525252] transition-colors mt-0.5"
            style={{
              textShadow:
                '0 0 8px #ffffff, 0 0 16px #ffffff, 0 0 24px #ffffff, 1px 1px 2px #ffffff, -1px -1px 2px #ffffff',
            }}
          >
            {currentRelease.subtitle}
          </p>
        </a>
      </div>
    </div>
  );
};
