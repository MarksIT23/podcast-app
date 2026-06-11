import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Container } from '../components/layout';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const addToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const user = await login(email, password);
        addToast('Welcome back!', 'success');
        navigate(user.role === 'admin' || user.role === 'moderator' ? '/admin' : '/dashboard');
      } else {
        await register(name, email, password);
        addToast('Account created successfully!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '13px 16px 13px 44px',
    fontSize: '0.9rem',
    color: '#fff',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#1DB954';
    e.target.style.background = 'rgba(255,255,255,0.09)';
    e.target.style.boxShadow = '0 0 0 3px rgba(29,185,84,0.1)';
  };
  const handleInputBlur = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    e.target.style.background = 'rgba(255,255,255,0.07)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{ background: '#0a0a0a' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full"
          style={{
            width: '600px', height: '600px',
            top: '-200px', left: '-200px',
            background: 'radial-gradient(circle, rgba(29,185,84,0.08) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '500px', height: '500px',
            bottom: '-150px', right: '-150px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <Container>
        <div className="max-w-md mx-auto relative z-10">
          {/* Logo */}
          <div className="text-center mb-10">
            <a href="/" className="inline-flex items-center gap-2.5 mb-8 justify-center">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #1DB954 0%, #158a3e 100%)',
                  boxShadow: '0 0 30px rgba(29,185,84,0.4)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 42 42" fill="none">
                  <path d="M8 21 Q21 8, 34 21" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M12 27 Q21 16, 30 27" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M16 33 Q21 24, 26 33" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <span
                className="font-black"
                style={{ color: '#fff', fontSize: '1.4rem', fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.03em' }}
              >
                Podora
              </span>
            </a>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login-header' : 'register-header'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1
                  className="font-black mb-2"
                  style={{
                    color: '#fff',
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    fontFamily: 'Poppins, sans-serif',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>
                  {isLogin
                    ? 'Sign in to your personalized podcast dashboard.'
                    : 'Join 10,000+ creators using AI-powered podcasting.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card */}
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: '#181818',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  />
                  <input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                    className="placeholder-white/25"
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                    aria-label="Full Name"
                  />
                </div>
              )}

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  className="placeholder-white/25"
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  aria-label="Email address"
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  className="placeholder-white/25"
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  aria-label="Password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {isLogin && (
                <div className="text-right">
                  <a
                    href="#"
                    className="text-sm transition-colors duration-150"
                    style={{ color: '#1DB954' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#1ED760'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#1DB954'; }}
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 font-bold text-sm transition-all duration-200"
                style={{
                  marginTop: '8px',
                  padding: '14px 24px',
                  borderRadius: '999px',
                  background: loading ? 'rgba(29,185,84,0.6)' : '#1DB954',
                  color: '#000',
                  boxShadow: '0 0 30px rgba(29,185,84,0.4)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#1ED760'; e.currentTarget.style.transform = 'scale(1.02)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = loading ? 'rgba(29,185,84,0.6)' : '#1DB954'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {loading ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"
                    />
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-3 text-xs"
                  style={{ background: '#181818', color: 'rgba(255,255,255,0.3)' }}
                >
                  or continue with
                </span>
              </div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              {['Google', 'GitHub'].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  className="flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200"
                  style={{
                    padding: '11px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.65)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                  }}
                >
                  {provider === 'Google' ? '🌐' : '🐙'} {provider}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Toggle */}
          <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold transition-colors duration-150"
              style={{ color: '#1DB954' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#1ED760'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#1DB954'; }}
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </Container>
    </div>
  );
}
