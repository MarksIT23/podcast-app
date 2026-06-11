"use client";

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [stats, setStats] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobCounts, setJobCounts] = useState({ success: 0, error: 0, running: 0 });
  const [loading, setLoading] = useState(true);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedCategory, setNewFeedCategory] = useState('Tech');
  const [syncMessage, setSyncMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // GSAP Refs
  const loginRef = useRef(null);
  const dashboardRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  // Check auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      // Animate login screen
      gsap.fromTo(loginRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        const [dashRes, feedsRes, jobsRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/feeds'),
          fetch('/api/jobs'),
        ]);

        if (dashRes.ok) setStats((await dashRes.json()).stats);
        if (feedsRes.ok) setFeeds((await feedsRes.json()).data || []);
        if (jobsRes.ok) {
          const jData = await jobsRes.json();
          setJobs(jData.data || []);
          setJobCounts(jData.counts || { success: 0, error: 0, running: 0 });
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // GSAP Dashboard Entrance
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { y: -30, opacity: 0, duration: 0.6, ease: 'power2.out' });
      // We will animate cards whenever activeTab changes
    }, dashboardRef);
    return () => ctx.revert();
  }, [isAuthenticated]);

  // Animate Tab content when tab changes or data loads
  useEffect(() => {
    if (isAuthenticated && !loading) {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [activeTab, loading, isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admin_token', data.token);
        // Animate out
        gsap.to(loginRef.current, {
          opacity: 0, y: -20, duration: 0.4, ease: 'power2.in',
          onComplete: () => setIsAuthenticated(true)
        });
      } else {
        setLoginError(data.error);
        gsap.fromTo(loginRef.current, { x: -10 }, { x: 10, duration: 0.1, yoyo: true, repeat: 3 });
      }
    } catch (err) {
      setLoginError('Network error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleAddFeed = async (e) => {
    e.preventDefault();
    if (!newFeedUrl) return;
    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newFeedUrl, category: newFeedCategory }),
      });
      const result = await res.json();
      if (res.ok) {
        setSyncMessage(`✓ Feed ingested. Synthesizing data...`);
        setNewFeedUrl('');
        const feedsRes = await fetch('/api/feeds');
        setFeeds((await feedsRes.json()).data || []);
      } else {
        setSyncMessage(`✗ ${result.error}`);
      }
    } catch (err) {
      setSyncMessage('Error connecting to Admin API.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div ref={loginRef} className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.05em' }}>Admin<span style={{ color: '#1DB954' }}>System</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '2rem' }}>Authenticate to access the orchestration dashboard.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              placeholder="Admin Password (admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
            {loginError && <p style={{ color: '#f87171', fontSize: '0.75rem', margin: 0 }}>{loginError}</p>}
            <button type="submit" className="btn-primary" disabled={isLoggingIn}>
              {isLoggingIn ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'feeds', label: 'RSS Sources' },
    { id: 'jobs', label: 'System Logs' },
  ];

  return (
    <div ref={dashboardRef} style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <header ref={headerRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.05em', margin: 0 }}>Admin<span style={{ color: '#1DB954' }}>System</span></h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Next.js • SQLite • Port 3003</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="http://localhost:3004" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.875rem', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={e => e.target.style.opacity=1} onMouseOut={e => e.target.style.opacity=0.7}>Editor →</a>
            <a href="http://localhost:5173" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.875rem', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={e => e.target.style.opacity=1} onMouseOut={e => e.target.style.opacity=0.7}>Public →</a>
            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.75rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </header>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { cardsRef.current = []; setActiveTab(tab.id); }}
              style={{
                padding: '0.5rem 1rem', borderRadius: '99px', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
                background: activeTab === tab.id ? '#1DB954' : 'transparent',
                color: activeTab === tab.id ? '#000' : 'rgba(255,255,255,0.6)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginTop: '4rem' }}>Synchronizing with SQLite database...</div>
        ) : (
          <div style={{ paddingBottom: '4rem' }}>
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {[
                  { label: 'Total Podcasts', value: stats.totalPodcasts },
                  { label: 'Total Episodes', value: stats.totalEpisodes },
                  { label: 'Ingested Feeds', value: stats.totalFeeds },
                  { label: 'Failed Syncs', value: stats.failedJobs, color: stats.failedJobs > 0 ? '#ef4444' : '#1DB954' },
                ].map((card, i) => (
                  <div key={i} ref={el => cardsRef.current[i] = el} className="glass-panel" style={{ padding: '1.5rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, margin: 0 }}>{card.label}</p>
                    <p style={{ fontSize: '3rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: 0, color: card.color || '#fff', letterSpacing: '-0.05em' }}>{card.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* FEEDS TAB */}
            {activeTab === 'feeds' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Form */}
                <div ref={el => cardsRef.current[0] = el} className="glass-panel" style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Add RSS Source</h2>
                  <form onSubmit={handleAddFeed} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>RSS URL</label>
                      <input type="url" value={newFeedUrl} onChange={(e) => setNewFeedUrl(e.target.value)} placeholder="https://feed.example.com/rss" required style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>Category</label>
                      <select value={newFeedCategory} onChange={(e) => setNewFeedCategory(e.target.value)} style={{ width: '100%' }}>
                        <option value="Tech">Tech</option>
                        <option value="Education">Education</option>
                        <option value="Business">Business</option>
                      </select>
                    </div>
                    <button type="submit" className="btn-primary">Ingest & Replicate</button>
                  </form>
                  {syncMessage && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(29, 185, 84, 0.1)', color: '#1DB954', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid rgba(29, 185, 84, 0.2)' }}>
                      {syncMessage}
                    </div>
                  )}
                </div>

                {/* List */}
                <div ref={el => cardsRef.current[1] = el} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Active Sources</h2>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                    {feeds.map((feed) => (
                      <div key={feed.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.25rem 0', wordBreak: 'break-all' }}>{feed.url}</p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                          <span>Status: <span style={{ color: feed.status === 'active' ? '#1DB954' : '#ef4444' }}>{feed.status}</span></span>
                          <span>Cat: {feed.category}</span>
                          <span>Eps: {feed._count?.episodes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* JOBS TAB */}
            {activeTab === 'jobs' && (
              <div ref={el => cardsRef.current[0] = el} className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Ingestion Sync Log</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                      <th style={{ textAlign: 'left', padding: '1rem 0' }}>Job Info</th>
                      <th style={{ textAlign: 'left', padding: '1rem 0' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '1rem 0' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.slice(0, 15).map((job) => (
                      <tr key={job.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem 0' }}>
                          <p style={{ margin: 0, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{job.type || 'SYNC_JOB'}</p>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{job.message || '—'}</p>
                        </td>
                        <td style={{ padding: '1rem 0' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                            background: job.status === 'success' ? 'rgba(29,185,84,0.1)' : 'rgba(239,68,68,0.1)',
                            color: job.status === 'success' ? '#1DB954' : '#ef4444',
                          }}>
                            {job.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0', textAlign: 'right', color: 'rgba(255,255,255,0.4)' }}>
                          {new Date(job.runAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
