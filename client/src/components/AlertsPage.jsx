import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, ShieldAlert, Layers, Bell, CheckCheck, Filter, RefreshCw } from 'lucide-react';
import { getSpeciesImageUrl } from '../utils/speciesImages';

const API_BASE = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

export default function AlertsPage({ species = [], sightings = [], recommendations = [] }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all' | 'critical' | 'warning' | 'info'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'endangered_sighting' | 'population_decline' | 'habitat_degradation' | 'device_offline' | 'conservation'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleEvaluate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/alerts/evaluate`, { method: 'POST' });
      if (res.ok) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to trigger alert evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  const alertSpecies = species.filter(sp => ['Critical', 'Vulnerable'].includes(sp.conservationStatus));
  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (severityFilter !== 'all' && n.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const getSeverityBorder = (sev) => {
    if (sev === 'critical') return '#ef4444';
    if (sev === 'warning') return '#f59e0b';
    return '#3b82f6';
  };

  const getSeverityBadgeClass = (sev) => {
    if (sev === 'critical') return 'badge-red';
    if (sev === 'warning') return 'badge-pill';
    return 'badge-teal';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-dark)' }}>System Alerts & Notifications</h2>
            {unreadCount > 0 && (
              <span className="badge-pill badge-red">{unreadCount} Unread</span>
            )}
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Real-time rule-based alerts triggered by species sightings, population trends, and system telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleEvaluate}
            className="btn-primary"
            style={{ background: '#ffffff', color: 'var(--forest-green)', border: '1px solid var(--border-light)', fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
          >
            <RefreshCw size={15} /> Evaluate Rules
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
            >
              <CheckCheck size={15} /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>UNREAD NOTIFICATIONS</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{unreadCount}</div>
            </div>
            <Bell size={20} color="#b91c1c" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>High-priority notifications pending review.</div>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CRITICAL ALERTS</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                {notifications.filter(n => n.severity === 'critical').length}
              </div>
            </div>
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Urgent conservation & endangered species triggers.</div>
        </div>

        <div className="eco-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>THREATENED SPECIES</div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{alertSpecies.length}</div>
            </div>
            <ShieldAlert size={20} color="#065f46" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Species classified Critical or Vulnerable.</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="eco-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)' }}>Filter Alerts:</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Severity:</label>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.82rem', outline: 'none' }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Type:</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.82rem', outline: 'none' }}
            >
              <option value="all">All Types</option>
              <option value="endangered_sighting">Endangered Sighting</option>
              <option value="population_decline">Population Decline</option>
              <option value="habitat_degradation">Habitat Degradation</option>
              <option value="device_offline">Device / Sensor Alert</option>
              <option value="conservation">Conservation Update</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Stream */}
      <div className="eco-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1.25rem' }}>Alert Notification Stream</h3>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: 'var(--text-muted)' }}>
            No notifications found matching the selected filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredNotifications.map(notif => (
              <div
                key={notif._id || notif.id}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${getSeverityBorder(notif.severity)}`,
                  background: notif.read ? '#ffffff' : '#fcfdfe',
                  borderTop: '1px solid var(--border-light)',
                  borderRight: '1px solid var(--border-light)',
                  borderBottom: '1px solid var(--border-light)',
                  boxShadow: notif.read ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className={`badge-pill ${getSeverityBadgeClass(notif.severity)}`}>
                      {notif.severity.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {notif.type.replace('_', ' ')}
                    </span>
                    {!notif.read && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                    {notif.title}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-medium)', lineHeight: 1.45 }}>
                    {notif.message}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif._id || notif.id)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--forest-green)',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categorized Conservation Recommendations Section */}
      <div className="eco-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>Conservation Action Recommendations</h3>
        <RecommendationTabs />
      </div>
    </div>
  );
}

function RecommendationTabs() {
  const [activeTab, setActiveTab] = useState('Priority');

  const tabs = {
    'Priority': [
      'Deploy immediate anti-poaching patrols along Bandipur Sector 4 waterholes.',
      'Establish 24/7 guard stations near Kaziranga elephant migration routes.'
    ],
    'Habitat Restoration': [
      'Initiate monsoonal runoff desiltation in Kaziranga Sector B wetland.',
      'Restore native vegetation corridors connecting Eastern and Western forest sectors.'
    ],
    'Protection Strategy': [
      'Enforce strict core zone buffer enforcement against illegal grazing.',
      'Deploy thermal night surveillance for vulnerable Bengal Tiger breeding zones.'
    ],
    'Monitoring Optimization': [
      'Replace telemetry battery units on offline Camera Trap CT-BTR-04.',
      'Calibrate bioacoustic recorders for seasonal bird migration vocalization tracking.'
    ],
    'Resource Allocation': [
      'Reallocate 3 ranger patrol teams to high-density tiger corridors.',
      'Procure solar-powered acoustic monitoring nodes for remote sectors.'
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {Object.keys(tabs).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              background: activeTab === tab ? 'var(--forest-green)' : '#f1f5f9',
              color: activeTab === tab ? '#ffffff' : 'var(--text-medium)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tabs[activeTab].map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid var(--forest-green)', fontSize: '0.85rem', color: 'var(--text-dark)' }}>
            <span style={{ fontWeight: 800, color: 'var(--forest-green)' }}>•</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
