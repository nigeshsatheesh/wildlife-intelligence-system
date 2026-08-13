import React, { useState } from 'react';
import { X, Lock, Mail, UserCheck, ShieldAlert } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Researcher');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      name: name || (isRegister ? 'Field Researcher' : 'Dr. Sarah Chen'),
      email: email || 'sarah.chen@wildlife.org',
      role: role
    };
    onLoginSuccess(userData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(6, 9, 7, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2rem', position: 'relative' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto'
          }}>
            <ShieldAlert size={28} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f0fdf4' }}>
            {isRegister ? 'Register Wildlife Intelligence System Access' : 'Researcher Authentication'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            JWT authentication & role-based security
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Full Name:</label>
              <input
                type="text"
                placeholder="Dr. Sarah Chen"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(6, 9, 7, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: '#f0fdf4',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Email Address:</label>
            <input
              type="email"
              placeholder="sarah.chen@wildlife.org"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(6, 9, 7, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
                color: '#f0fdf4',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Password:</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(6, 9, 7, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
                color: '#f0fdf4',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Access Role:</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(6, 9, 7, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
                color: '#f0fdf4',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="Researcher">Researcher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button className="btn-primary" type="submit" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            <UserCheck size={16} />
            <span>{isRegister ? 'Create Account' : 'Authenticate & Sign In'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {isRegister ? 'Already registered?' : "Don't have access credentials?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'transparent', border: 'none', color: '#10b981', fontWeight: '600', cursor: 'pointer' }}
          >
            {isRegister ? 'Sign In' : 'Register Account'}
          </button>
        </div>

      </div>
    </div>
  );
}
