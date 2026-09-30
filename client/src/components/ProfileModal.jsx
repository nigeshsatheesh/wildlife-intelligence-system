import React, { useState } from 'react';
import { User, Lock, X, Check } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

export default function ProfileModal({ user, isOpen, onClose, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
  const [name, setName] = useState(user?.name || '');
  const [organization, setOrganization] = useState(user?.organization || 'EcoGuard Organization');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#113829');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ name, organization, avatarColor })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      const updated = await res.json();
      if (typeof onUpdateUser === 'function') onUpdateUser(updated);
      setMsg('Profile updated successfully!');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setErrorMsg('New passwords do not match');
    }
    setSaving(true);
    setMsg('');
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/auth/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to change password');
      }

      setMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '460px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>User Profile Settings</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Update account information and security parameters.</p>

        {/* Tab Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '1.25rem' }}>
          <button
            onClick={() => { setActiveTab('profile'); setErrorMsg(''); setMsg(''); }}
            style={{ padding: '0.6rem 1rem', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.85rem', color: activeTab === 'profile' ? 'var(--forest-green)' : 'var(--text-muted)', borderBottom: activeTab === 'profile' ? '2px solid var(--forest-green)' : 'none', cursor: 'pointer' }}
          >
            Profile Info
          </button>
          <button
            onClick={() => { setActiveTab('password'); setErrorMsg(''); setMsg(''); }}
            style={{ padding: '0.6rem 1rem', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.85rem', color: activeTab === 'password' ? 'var(--forest-green)' : 'var(--text-muted)', borderBottom: activeTab === 'password' ? '2px solid var(--forest-green)' : 'none', cursor: 'pointer' }}
          >
            Change Password
          </button>
        </div>

        {msg && <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.6rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 700 }}>{msg}</div>}
        {errorMsg && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.6rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 700 }}>{errorMsg}</div>}

        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Full Name:</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Email Address (read-only):</label>
              <input
                type="text"
                value={user?.email || ''}
                disabled
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', background: '#f8fafc', color: 'var(--text-muted)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Organization / Department:</label>
              <input
                type="text"
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Current Password:</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem', display: 'block' }}>Confirm New Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
