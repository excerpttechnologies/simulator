'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from './use-reduced-motion';

const HERO_VIDEO_SRC = '/hero-background.mp4';

export function PremiumHeroBackground() {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay can be blocked until user interaction; keep muted loop ready.
      });
    }
  }, [reduced]);

  // Update mouse position for the spotlight overlay
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setSpotlightPos({ x, y, active: true });
    };

    const handleMouseLeave = () => {
      setSpotlightPos((prev) => ({ ...prev, active: false }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-screen max-h-[100dvh] overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #FAFBFC 0%, #F5F7FA 45%, #EEF1F6 100%)',
      }}
      aria-hidden
    >
      {!reduced && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover scale-105"
          style={{ filter: 'brightness(1.08) saturate(1.15) contrast(1.05)' }}
          src={HERO_VIDEO_SRC}
        />
      )}

      {/* Subtle scrim — keeps headline readable without hiding the video */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(250,251,252,0.42) 0%, rgba(245,247,250,0.18) 38%, rgba(238,241,246,0.28) 72%, rgba(250,251,252,0.55) 100%)',
        }}
      />

      {/* Soft vignette so edges blend into the page */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 70% at 50% 40%, transparent 0%, rgba(250,251,252,0.35) 100%)',
        }}
      />

      {/* 1. Cursor soft spotlight — warm white light */}
      {spotlightPos.active && !reduced && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(700px circle at ${spotlightPos.x}px ${spotlightPos.y}px,
              rgba(255, 157, 46, 0.06) 0%,
              rgba(255, 122, 0, 0.025) 35%,
              transparent 70%)`,
            transition: 'opacity 0.4s ease',
          }}
        />
      )}

      {/* Ambient glow orbs — kept very faint so video stays visible */}
      <motion.div
        className="absolute top-[5%] left-[18%] rounded-full"
        style={{
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, rgba(255,122,0,0.03) 0%, transparent 68%)',
          filter: 'blur(80px)',
        }}
        animate={reduced ? undefined : { x: ['-3%', '3%', '-3%'], y: ['-2%', '2%', '-2%'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[8%] top-[15%] rounded-full"
        style={{
          width: 560,
          height: 560,
          background: 'radial-gradient(circle, rgba(255,200,87,0.025) 0%, transparent 68%)',
          filter: 'blur(70px)',
        }}
        animate={reduced ? undefined : { x: ['0%', '-3%', '0%'], y: ['0%', '2.5%', '0%'] }}
        transition={{ duration: 27, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
    </div>
  );
}
