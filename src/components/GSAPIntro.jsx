import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

/**
 * GSAPIntro — Full-screen Spotify-style startup animation.
 * Plays once on first load, then fades out revealing the app.
 */
export default function GSAPIntro({ onComplete }) {
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const logoTextRef = useRef(null);
  const taglineRef = useRef(null);
  const barsRef = useRef([]);
  const circleRef = useRef(null);
  const ripple1Ref = useRef(null);
  const ripple2Ref = useRef(null);
  const [visible, setVisible] = useState(true);

  // Keep a ref to onComplete so the GSAP effect below doesn't need to
  // re-run when App passes a new inline function every render.
  // Without this, the effect would re-run after the animation completes
  // (when visible=false + DOM is nulled), causing GSAP to crash on null refs.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setVisible(false);
          if (onCompleteRef.current) onCompleteRef.current();
        },
      });

      // ─── Set initial states ───
      gsap.set(overlayRef.current, { opacity: 1 });
      gsap.set(logoRef.current, { scale: 0, opacity: 0, rotation: -30 });
      gsap.set(logoTextRef.current, { x: -40, opacity: 0 });
      gsap.set(taglineRef.current, { y: 20, opacity: 0 });
      gsap.set(barsRef.current, { scaleY: 0, transformOrigin: 'bottom' });
      gsap.set(circleRef.current, { scale: 0, opacity: 0 });
      gsap.set(ripple1Ref.current, { scale: 0, opacity: 0 });
      gsap.set(ripple2Ref.current, { scale: 0, opacity: 0 });

      // ─── Phase 1: Logo materializes ───
      tl.to(circleRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.7)',
      })
        .to(
          logoRef.current,
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.45,
            ease: 'back.out(2)',
          },
          '-=0.2'
        )

        // ─── Phase 2: Ripple pulse ───
        .to(
          ripple1Ref.current,
          {
            scale: 2.5,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.15'
        )
        .to(
          ripple2Ref.current,
          {
            scale: 3.5,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.5'
        )

        // ─── Phase 3: Logo text slides in ───
        .to(
          logoTextRef.current,
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            ease: 'power3.out',
          },
          '-=0.4'
        )

        // ─── Phase 4: Waveform bars animate ───
        .to(
          barsRef.current,
          {
            scaleY: 1,
            duration: 0.3,
            ease: 'power3.out',
            stagger: {
              amount: 0.25,
              from: 'center',
            },
          },
          '-=0.15'
        )

        // ─── Phase 5: Live waveform dance ───
        .to(
          barsRef.current,
          {
            scaleY: () => 0.3 + Math.random() * 0.7,
            duration: 0.15,
            ease: 'none',
            stagger: 0.02,
            repeat: 2,
            yoyo: true,
          }
        )

        // ─── Phase 6: Tagline appears ───
        .to(
          taglineRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          },
          '-=0.15'
        )

        // ─── Phase 7: Hold + logo scale up ───
        .to({}, { duration: 0.3 })
        .to(
          [logoRef.current, circleRef.current, logoTextRef.current],
          {
            scale: 1.08,
            duration: 0.15,
            ease: 'power2.inOut',
          }
        )
        .to(
          [logoRef.current, circleRef.current, logoTextRef.current],
          {
            scale: 1,
            duration: 0.15,
            ease: 'power2.inOut',
          }
        )

        // ─── Phase 8: Fade entire overlay out ───
        .to({}, { duration: 0.2 })
        .to(overlayRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          pointerEvents: 'none',
        });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #000000 70%)',
      }}
      aria-label="Loading Podora"
      role="status"
    >
      {/* Ambient glow behind everything */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(29,185,84,0.08) 0%, transparent 65%)',
        }}
      />

      {/* Center content */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Logo circle with ripples */}
        <div className="relative flex items-center justify-center">
          {/* Ripple rings */}
          <div
            ref={ripple1Ref}
            className="absolute w-24 h-24 rounded-full border-2"
            style={{ borderColor: 'rgba(29,185,84,0.4)' }}
          />
          <div
            ref={ripple2Ref}
            className="absolute w-24 h-24 rounded-full border"
            style={{ borderColor: 'rgba(29,185,84,0.2)' }}
          />

          {/* Glow circle bg */}
          <div
            ref={circleRef}
            className="absolute w-24 h-24 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(29,185,84,0.25) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }}
          />

          {/* Logo icon */}
          <div
            ref={logoRef}
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #1DB954 0%, #158a3e 100%)',
              boxShadow: '0 0 40px rgba(29,185,84,0.6)',
            }}
          >
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <circle cx="21" cy="21" r="20" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
              <path d="M10 21 Q21 10, 32 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M13 26 Q21 17, 29 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M16 31 Q21 24, 26 31" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Logo text */}
        <div
          ref={logoTextRef}
          className="flex items-center gap-1"
        >
          <span
            className="text-white font-black tracking-tight"
            style={{ fontSize: '1.75rem', fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.04em' }}
          >
            Podora
          </span>
          <span
            className="text-xs font-bold tracking-widest uppercase mt-1 ml-1 px-1.5 py-0.5 rounded"
            style={{ color: '#1DB954', border: '1px solid rgba(29,185,84,0.4)', fontSize: '0.5rem' }}
          >
            Beta
          </span>
        </div>

        {/* Waveform bars */}
        <div className="flex items-end gap-1" style={{ height: '36px' }} aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => {
            const heights = [14, 22, 30, 26, 36, 28, 20, 32, 24, 18, 28, 36, 22, 30, 16, 26, 34, 20, 28, 14];
            return (
              <div
                key={i}
                ref={(el) => (barsRef.current[i] = el)}
                className="rounded-full"
                style={{
                  width: '3px',
                  height: `${heights[i]}px`,
                  background: i % 3 === 0
                    ? '#1DB954'
                    : i % 3 === 1
                      ? 'rgba(29,185,84,0.6)'
                      : 'rgba(29,185,84,0.3)',
                }}
              />
            );
          })}
        </div>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="text-center"
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontFamily: 'DM Sans, Inter, sans-serif',
          }}
        >
          AI-Powered Podcast Discovery
        </p>
      </div>
    </div>
  );
}
