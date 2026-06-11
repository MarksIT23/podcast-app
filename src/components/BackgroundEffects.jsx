import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * BackgroundEffects — Spotify-dark ambient orbs, noise grain, and grid.
 */
export default function BackgroundEffects() {
  const orb1 = useRef(null);
  const orb2 = useRef(null);
  const orb3 = useRef(null);

  useEffect(() => {
    // Slow ambient drift
    gsap.to(orb1.current, {
      x: 60, y: -40,
      duration: 14,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
    gsap.to(orb2.current, {
      x: -80, y: 60,
      duration: 18,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 3,
    });
    gsap.to(orb3.current, {
      x: 40, y: 80,
      duration: 22,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 7,
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Primary green orb */}
      <div
        ref={orb1}
        className="absolute rounded-full"
        style={{
          width: '800px',
          height: '800px',
          top: '-300px',
          left: '-300px',
          background: 'radial-gradient(circle, rgba(29,185,84,0.09) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Purple orb */}
      <div
        ref={orb2}
        className="absolute rounded-full"
        style={{
          width: '700px',
          height: '700px',
          bottom: '-200px',
          right: '-200px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Blue orb */}
      <div
        ref={orb3}
        className="absolute rounded-full"
        style={{
          width: '500px',
          height: '500px',
          top: '45%',
          left: '55%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: 0.3,
        }}
      />

      {/* Noise texture */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.025 }}>
        <filter id="sp-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#sp-noise)" />
      </svg>

      {/* Bottom vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  );
}
