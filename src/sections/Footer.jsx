import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Container } from '../components/layout';
import { Mail, ExternalLink, Globe, Hash, AtSign, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  Podcasts: ['Technology', 'Science', 'Business', 'Entertainment', 'Education', 'Health'],
  Company: ['About Us', 'Careers', 'Press Kit', 'Blog', 'Partners'],
  Support: ['Help Center', 'Contact', 'Community', 'Status', 'Docs'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
};

const socialLinks = [
  { icon: ExternalLink, label: 'Twitter / X', href: '#' },
  { icon: AtSign, label: 'Instagram', href: '#' },
  { icon: Hash, label: 'LinkedIn', href: '#' },
  { icon: Globe, label: 'Facebook', href: '#' },
];

export default function Footer() {
  const footerRef = useRef(null);
  const newsletterRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        newsletterRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: newsletterRef.current, start: 'top 88%' },
        }
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative mt-16"
      style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      role="contentinfo"
    >
      {/* Top green gradient line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: '60%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(29,185,84,0.5), transparent)',
        }}
        aria-hidden="true"
      />

      <Container className="relative">
        {/* Newsletter */}
        <div
          ref={newsletterRef}
          className="text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(29,185,84,0.1) 0%, rgba(59,130,246,0.06) 50%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '28px',
            padding: '56px 40px',
            margin: '60px 0 64px',
            opacity: 0,
          }}
        >
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: 'rgba(29,185,84,0.15)',
              border: '1px solid rgba(29,185,84,0.25)',
            }}
            aria-hidden="true"
          >
            <Mail size={28} style={{ color: '#1DB954' }} />
          </div>

          <h3
            className="font-black mb-3"
            style={{
              color: '#fff',
              fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: '-0.03em',
            }}
          >
            Stay <span style={{ color: '#1DB954' }}>in the Loop</span>
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 32px', lineHeight: 1.7 }}>
            Weekly AI-powered podcast highlights, industry insights, and exclusive content delivered to your inbox.
          </p>

          <form
            className="flex gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Newsletter signup"
          >
            <div className="flex-1">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="your@email.com"
                className="w-full text-sm focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '999px',
                  padding: '13px 22px',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1DB954';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,185,84,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                autoComplete="email"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 font-bold text-sm flex-shrink-0"
              style={{
                padding: '13px 24px',
                borderRadius: '999px',
                background: '#1DB954',
                color: '#000',
                boxShadow: '0 0 24px rgba(29,185,84,0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1ED760'; e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1DB954'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Subscribe <ArrowRight size={15} />
            </button>
          </form>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '14px' }}>
            No spam. Unsubscribe anytime. 10,000+ subscribers.
          </p>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className="font-bold mb-4 text-xs"
                style={{
                  color: '#fff',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
                id={`footer-heading-${category.toLowerCase()}`}
              >
                {category}
              </h4>
              <ul
                className="space-y-3"
                aria-labelledby={`footer-heading-${category.toLowerCase()}`}
                role="list"
              >
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-6 py-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1DB954 0%, #158a3e 100%)' }}
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 42 42" fill="none">
                <path d="M8 21 Q21 8, 34 21" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M12 27 Q21 16, 30 27" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M16 33 Q21 24, 26 33" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <span
              className="font-black"
              style={{
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              Podora
            </span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Podora. All rights reserved.
          </p>

          {/* Social links */}
          <nav aria-label="Social media links">
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29,185,84,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(29,185,84,0.3)';
                    e.currentTarget.style.color = '#1DB954';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Icon size={15} aria-hidden="true" />
                </a>
              ))}
            </div>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
