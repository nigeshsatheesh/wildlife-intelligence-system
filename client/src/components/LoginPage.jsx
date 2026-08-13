import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Radar, LogIn } from 'lucide-react';

export default function LoginPage({ onLogin, onNavigateRegister }) {
  const [email, setEmail] = useState('dr.smith@conservation.org');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthenticating(true);
    setError('');

    const result = await onLogin({ email, password });
    if (!result.success) {
      setError(result.message || 'Unable to authenticate');
    }

    setAuthenticating(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: '#f7faf8',
      color: '#181c1b',
      overflow: 'hidden',
      padding: '1.5rem'
    }}>
      {/* Background Silhouette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.15,
        pointerEvents: 'none',
        backgroundImage: 'url("https://images.unsplash.com/photo-1511497584788-876761c144ee?auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'grayscale(50%)'
      }}></div>

      {/* Login Card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '440px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
        padding: '2.5rem 2rem',
        border: '1px solid #e0e3e1'
      }}>
        {/* Brand Icon Header (uses project logo at /logo.png) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.75rem', position: 'relative' }}>
          <div style={{ marginBottom: '1rem' }}>
            <img src="/logo.png" alt="Wildlife Intelligence" style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 8 }} />
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#012d1d', letterSpacing: '-0.01em' }}>
            Wildlife Intelligence System
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#414844', marginTop: '0.25rem', maxWidth: '280px' }}>
            Secure access to real-time ecological monitoring and analytics.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#414844', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
              Researcher Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#717973" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="dr.smith@conservation.org"
                style={{
                  width: '100%',
                  background: '#f1f4f2',
                  border: '1px solid transparent',
                  borderRadius: '8px',
                  padding: '0.75rem 0.85rem 0.75rem 2.6rem',
                  fontSize: '0.88rem',
                  color: '#181c1b',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#414844', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Access Key
              </label>
              <a href="#forgot" style={{ fontSize: '0.72rem', fontWeight: '700', color: '#012d1d', textDecoration: 'none' }}>
                Forgot key?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#717973" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: '#f1f4f2',
                  border: '1px solid transparent',
                  borderRadius: '8px',
                  padding: '0.75rem 2.6rem',
                  fontSize: '0.88rem',
                  color: '#181c1b',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#717973', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: '#c0392b', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              background: '#012d1d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 6px rgba(1, 45, 29, 0.2)',
              marginTop: '0.5rem'
            }}
          >
            <LogIn size={18} />
            <span>{authenticating ? 'Authenticating...' : 'Access Secure System'}</span>
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #eceeed' }}>
          <p style={{ fontSize: '0.8rem', color: '#414844' }}>
            Unregistered researcher?{' '}
            <button
              onClick={onNavigateRegister}
              style={{ background: 'transparent', border: 'none', color: '#012d1d', fontWeight: '700', cursor: 'pointer' }}
            >
              Request clearance
            </button>
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '1rem', background: '#eceeed', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.7rem', color: '#414844', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <ShieldCheck size={14} color="#012d1d" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        {/* System Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', opacity: 0.75 }}>
          <div className="pulse-dot"></div>
          <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#414844', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            All Systems Operational
          </span>
        </div>
      </div>
    </div>
  );
}
