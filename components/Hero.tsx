"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      const progress = Math.min(Math.max(y / h, 0), 1);
      const s = 1 - progress * 0.06; // slight scale down
      const o = 1 - progress * 0.6;
      setScale(s);
      setOpacity(o);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-white scroll-mt-20">
      <div
        className="absolute inset-0 flex items-start justify-center pointer-events-none"
        style={{ ['--hero-scale' as any]: scale, ['--hero-opacity' as any]: opacity }}
      >
        <h1
          className="font-extrabold text-[#0A0A0A] text-center leading-none select-none"
          style={{ fontSize: "clamp(80px,14vw,180px)", transform: `scale(var(--hero-scale))`, opacity: `var(--hero-opacity)` }}
        >
          Accountin.
        </h1>
      </div>

      {/* Blob */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[500px] h-[500px] md:w-[600px] md:h-[600px] lg:w-[700px] lg:h-[700px]">
          <div className="blob mx-auto" aria-hidden />
          <div className="blob-ring" aria-hidden />
        </div>
      </div>

      {/* Bottom-left info */}
      <div className="absolute left-8 bottom-12 flex flex-col items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-sm font-semibold">AB</div>
            <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-sm font-semibold">CD</div>
            <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-sm font-semibold">EF</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0A0A0A]">2M+</div>
            <div className="text-xs text-gray-500">World active user</div>
          </div>
        </div>

        <p className="text-sm text-gray-600 max-w-[220px]">The design software that keeps your flow with AI tools and built-in graphics</p>

        <div className="text-sm text-gray-400">· · · · · · · · · ·</div>
      </div>

      {/* Bottom-right stacked list and big neon button */}
      <div className="absolute right-8 bottom-8 flex flex-col items-end gap-6">
        <div className="text-right text-xs text-gray-400">
          <div>Web based <span className="text-[#888]">/01</span></div>
          <div>Collaborative <span className="text-[#888]">/02</span></div>
          <div>Real-time <span className="text-[#888]">/03</span></div>
        </div>

        <button className="w-[120px] h-[120px] rounded-full bg-[#CCFF00] text-black font-semibold text-[12px] flex items-center justify-center">
          ▶ How it works?
        </button>
      </div>

      <style jsx>{`
        .blob {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 40%, #CCFF00 0%, #8ABF00 30%, #4A4A4A 60%, #9A9A9A 100%);
          animation: blobMorph 8s ease-in-out infinite, blobRotate 12s linear infinite;
          filter: drop-shadow(0 40px 80px rgba(12,12,12,0.12));
        }
        .blob-ring {
          position: absolute;
          left: 50%;
          top: 60%;
          transform: translate(-50%, -50%) rotateX(70deg);
          width: 110%;
          height: 40%;
          border-radius: 50%;
          border: 2px solid rgba(180,210,100,0.4);
        }

        @keyframes blobMorph {
          0% { border-radius: 40% 60% 55% 45% / 45% 45% 55% 55%; }
          25% { border-radius: 55% 45% 60% 40% / 60% 50% 50% 40%; }
          50% { border-radius: 45% 55% 40% 60% / 50% 60% 40% 50%; }
          75% { border-radius: 60% 40% 50% 50% / 40% 50% 60% 50%; }
          100% { border-radius: 40% 60% 55% 45% / 45% 45% 55% 55%; }
        }
        @keyframes blobRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
