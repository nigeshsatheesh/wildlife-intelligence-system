import React, { useState } from 'react';
import { User, Mail, Lock, Shield, ArrowRight, Leaf } from 'lucide-react';

export default function RegisterPage({ onRegister, onNavigateLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Researcher');
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setRegistering(true);
    setError('');

    try {
      const result = await onRegister({
        name: fullName || 'Dr. Jane Doe',
        email: email || 'jane.doe@conservation.org',
        password,
        role
      });

      if (!result.success) {
        setError(result.message || 'Unable to register');
      }

      // Successful registration
      // App.jsx should handle setting the user and showing the dashboard

    } catch (err) {
      console.error('Registration error:', err);
      setError('Unable to register. Please try again.');
    } finally {
      setRegistering(false);
    }
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

      {/* Register Card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        border: '1px solid #e0e3e1'
      }}>
        {/* Header Section (use project logo at /logo.png) */}
        <div style={{ padding: '2rem 2rem 1.5rem 2rem', textAlign: 'center', borderBottom: '1px solid #e0e3e1' }}>
          <div style={{ margin: '0 auto 1rem auto' }}>
            <img
              src="/logo.png"
              alt="Wildlife Intelligence"
              style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 12 }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="#ffffff"/><circle cx="80" cy="50" r="32" fill="#174f3a"/><text x="50%" y="140" font-size="18" text-anchor="middle" fill="#174f3a" font-family="Arial">Wildlife</text></svg>
                `);
              }}
            />
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#012d1d', letterSpacing: '-0.01em' }}>
            Join the Network
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#414844', marginTop: '0.25rem' }}>
            Create your researcher or admin account to access the monitoring dashboard.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#414844', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#717973" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Dr. Jane Doe"
                style={{
                  width: '100%',
                  background: '#f1f4f2',
                  border: '1px solid transparent',
                  borderRadius: '8px',
                  padding: '0.7rem 0.85rem 0.7rem 2.6rem',
                  fontSize: '0.88rem',
                  color: '#181c1b',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#414844', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#717973" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane.doe@conservation.org"
                style={{
                  width: '100%',
                  background: '#f1f4f2',
                  border: '1px solid transparent',
                  borderRadius: '8px',
                  padding: '0.7rem 0.85rem 0.7rem 2.6rem',
                  fontSize: '0.88rem',
                  color: '#181c1b',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#414844', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
              Assigned Role
            </label>
            <div style={{ position: 'relative' }}>
              <Shield size={18} color="#717973" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{
                  width: '100%',
                  background: '#f1f4f2',
                  border: '1px solid transparent',
                  borderRadius: '8px',
                  padding: '0.7rem 0.85rem 0.7rem 2.6rem',
                  fontSize: '0.88rem',
                  color: '#181c1b',
                  outline: 'none',
                  fontWeight: '600'
                }}
              >
                <option value="Researcher">Field Researcher</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#414844', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#717973" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    background: '#f1f4f2',
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '0.7rem 0.75rem 0.7rem 2.3rem',
                    fontSize: '0.88rem',
                    color: '#181c1b',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#414844', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#717973" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    background: '#f1f4f2',
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '0.7rem 0.75rem 0.7rem 2.3rem',
                    fontSize: '0.88rem',
                    color: '#181c1b',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
          {error && (
            <div
              style={{
                color: '#c0392b',
                background: '#fef2f2',
                padding: '0.7rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={registering}
            style={{
              width: '100%',
              background: '#012d1d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: registering ? 'not-allowed' : 'pointer',
              opacity: registering ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              boxShadow: '0 2px 6px rgba(1, 45, 29, 0.2)'
            }}
          >
            <span>
              {registering ? 'Creating Account...' : 'Create Account'}
            </span>

            {!registering && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Footer */}
        <div style={{ padding: '1.25rem 2rem', background: '#f1f4f2', borderTop: '1px solid #e0e3e1', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: '#414844' }}>
            Already have an account?{' '}
            <button
              onClick={onNavigateLogin}
              style={{ background: 'transparent', border: 'none', color: '#012d1d', fontWeight: '700', cursor: 'pointer' }}
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
