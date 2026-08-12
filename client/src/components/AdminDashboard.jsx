import React from 'react';
import { Users, Layers, MapPin, Eye, Shield, MoreHorizontal, UserCheck } from 'lucide-react';

export default function AdminDashboard({ analytics, species, sites, sightings, users }) {
  const registeredUsers = users || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>Admin Operations & System Metrics</h2>
          <span className="badge-pill badge-green">Administrator Console</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Manage research personnel, species taxonomy databases, and system telemetry configuration
        </p>
      </div>

      {/* Admin 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              TOTAL USERS
            </span>
            <Users size={18} color="var(--forest-green)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            {registeredUsers.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Active Personnel</div>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              TOTAL SPECIES
            </span>
            <Layers size={18} color="var(--forest-green)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            {species.length || 12}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Monitored Taxa</div>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              TOTAL SITES
            </span>
            <MapPin size={18} color="var(--forest-green)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            {sites.length || 4}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Field Stations</div>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              SIGHTINGS LOGGED
            </span>
            <Eye size={18} color="var(--forest-green)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            {sightings.length || 142}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Field Records</div>
        </div>
      </div>

      {/* Registered Users Table */}
      <div className="eco-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-dark)' }}>Registered System Personnel</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Authorized researchers & administrator accounts</p>
          </div>
          <button className="btn-new-survey" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}>
            <UserCheck size={15} /> Add User
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Personnel Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email Address</th>
                <th style={{ padding: '0.75rem 1rem' }}>System Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date Joined</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registeredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                    {user.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-medium)' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`badge-pill ${user.role === 'Admin' ? 'badge-red' : 'badge-green'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-light)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--text-dark)',
                      cursor: 'pointer'
                    }}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
