<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { gsap } from 'gsap';

// Auth State
const isAuthenticated = ref(false);
const password = ref('');
const loginError = ref('');
const isLoggingIn = ref(false);

// App State
const highlights = ref([]);
const dashboardStats = ref(null);
const podcasts = ref([]);
const loading = ref(true);
const actionStatus = ref('');
const activeTab = ref('dashboard');

const EDITOR_API = 'http://localhost:3005/api/editor';

// GSAP Refs
const loginRef = ref(null);
const dashboardRef = ref(null);
const headerRef = ref(null);
const cardsContainerRef = ref(null);

onMounted(() => {
  const token = localStorage.getItem('editor_token');
  if (token) {
    isAuthenticated.value = true;
    fetchAll();
  } else {
    // Animate login entrance
    gsap.fromTo(loginRef.value, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
  }
});

const handleLogin = async () => {
  isLoggingIn.value = true;
  loginError.value = '';
  try {
    const res = await fetch(`${EDITOR_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('editor_token', data.token);
      // Animate login out
      gsap.to(loginRef.value, {
        opacity: 0, y: -20, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          isAuthenticated.value = true;
          fetchAll();
        }
      });
    } else {
      loginError.value = data.error;
      gsap.fromTo(loginRef.value, { x: -10 }, { x: 10, duration: 0.1, yoyo: true, repeat: 3 });
    }
  } catch (err) {
    loginError.value = 'Network error.';
  } finally {
    isLoggingIn.value = false;
  }
};

const handleLogout = () => {
  localStorage.removeItem('editor_token');
  isAuthenticated.value = false;
  password.value = '';
};

// Data Fetching
const fetchAll = async () => {
  try {
    const [hlRes, dashRes, podRes] = await Promise.all([
      fetch(`${EDITOR_API}/highlights`),
      fetch(`${EDITOR_API}/dashboard`),
      fetch(`${EDITOR_API}/podcasts`),
    ]);

    if (hlRes.ok) highlights.value = (await hlRes.json()).data || [];
    if (dashRes.ok) dashboardStats.value = (await dashRes.json()).stats;
    if (podRes.ok) podcasts.value = (await podRes.json()).data || [];
  } catch (err) {
    console.error('Failed to load editor data:', err);
  } finally {
    loading.value = false;
    triggerEntranceAnimation();
  }
};

// Actions
const approveHighlight = async (id) => {
  try {
    const res = await fetch(`${EDITOR_API}/highlights/${id}/approve`, { method: 'POST' });
    if (res.ok) {
      actionStatus.value = 'Highlight approved and synced to MongoDB!';
      await fetchAll();
    }
  } catch (err) {
    actionStatus.value = 'Failed to approve highlight.';
  }
};

const rejectHighlight = async (id) => {
  try {
    const res = await fetch(`${EDITOR_API}/highlights/${id}/reject`, { method: 'POST' });
    if (res.ok) {
      actionStatus.value = 'Highlight rejected.';
      await fetchAll();
    }
  } catch (err) {
    actionStatus.value = 'Failed to reject highlight.';
  }
};

const toggleFeatured = async (podcast) => {
  try {
    await fetch(`${EDITOR_API}/podcasts/${podcast.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !podcast.featured }),
    });
    actionStatus.value = `${podcast.title} featured status toggled in MongoDB.`;
    await fetchAll();
  } catch (err) {
    actionStatus.value = 'Failed to update podcast.';
  }
};

// GSAP Animations
const triggerEntranceAnimation = () => {
  nextTick(() => {
    if (headerRef.value) {
      gsap.fromTo(headerRef.value, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
    }
    triggerCardsAnimation();
  });
};

const triggerCardsAnimation = () => {
  nextTick(() => {
    if (cardsContainerRef.value && cardsContainerRef.value.children.length > 0) {
      gsap.fromTo(
        cardsContainerRef.value.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );
    }
  });
};

// Re-animate when tab changes
watch(activeTab, () => {
  triggerCardsAnimation();
});
</script>

<template>
  <div class="app">
    <!-- LOGIN VIEW -->
    <div v-if="!isAuthenticated" class="auth-wrapper">
      <div ref="loginRef" class="glass-panel login-panel">
        <h1 class="brand-title">Editor<span class="accent">System</span></h1>
        <p class="brand-desc">Authenticate to access the review queues.</p>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <input 
            type="password" 
            v-model="password" 
            placeholder="Editor Password (editor123)" 
            required
            class="input-field"
          />
          <p v-if="loginError" class="error-text">{{ loginError }}</p>
          <button type="submit" class="btn-primary" :disabled="isLoggingIn">
            {{ isLoggingIn ? 'Verifying...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>

    <!-- DASHBOARD VIEW -->
    <div v-else ref="dashboardRef" class="container">
      <!-- Header -->
      <header ref="headerRef" class="header">
        <div>
          <h1 class="brand-title" style="margin:0;">Editor<span class="accent">System</span></h1>
          <p class="brand-desc" style="margin-top:0.25rem;">Vue 3 • MongoDB • Port 3004</p>
        </div>
        <div class="nav-links">
          <a href="http://localhost:3003" class="link">Admin →</a>
          <a href="http://localhost:5173" class="link">Public →</a>
          <button @click="handleLogout" class="link btn-logout">Logout</button>
        </div>
      </header>

      <!-- Tabs -->
      <nav class="tabs">
        <button
          v-for="tab in [
            { id: 'dashboard', label: 'Dashboard' }, 
            { id: 'podcasts', label: 'Podcast Queue' }, 
            { id: 'highlights', label: 'AI Highlights' }
          ]"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab', activeTab === tab.id ? 'active' : '']"
        >
          {{ tab.label }}
        </button>
      </nav>

      <!-- Alert -->
      <div v-if="actionStatus" class="alert glass-panel" @click="actionStatus = ''">
        {{ actionStatus }}
      </div>

      <div v-if="loading" style="text-align: center; color: rgba(255,255,255,0.5); margin-top: 4rem;">
        Synchronizing with MongoDB...
      </div>

      <!-- Content Views -->
      <div v-else ref="cardsContainerRef" style="padding-bottom: 4rem;">
        
        <!-- DASHBOARD TAB -->
        <div v-if="activeTab === 'dashboard' && dashboardStats" class="stats-grid">
          <div class="glass-panel stat-card" v-for="(card, i) in [
            { label: 'Podcasts', value: dashboardStats.totalPodcasts },
            { label: 'Episodes', value: dashboardStats.totalEpisodes },
            { label: 'Highlights', value: dashboardStats.totalHighlights },
            { label: 'Pending Reviews', value: dashboardStats.pendingReviews, color: '#f59e0b' },
            { label: 'Approved', value: dashboardStats.approvedHighlights, color: '#1DB954' },
            { label: 'Rejected', value: dashboardStats.rejectedHighlights, color: '#ef4444' },
          ]" :key="i">
            <p class="stat-label">{{ card.label }}</p>
            <p class="stat-value" :style="{ color: card.color || '#fff' }">{{ card.value }}</p>
          </div>
        </div>

        <!-- PODCASTS TAB -->
        <div v-if="activeTab === 'podcasts'" class="glass-panel p-4">
          <h2 class="section-title">Podcast Review Queue</h2>
          <div v-if="podcasts.length === 0" class="empty-state">No podcasts synced to MongoDB yet.</div>
          <div v-else class="list">
            <div v-for="p in podcasts" :key="p.id" class="list-item">
              <div class="item-info">
                <p class="item-title">{{ p.title || 'Untitled Podcast' }}</p>
                <p class="item-meta">
                  Host: {{ p.host || '—' }} • 
                  Status: <span :style="{ color: p.status === 'published' ? '#1DB954' : '#f59e0b' }">{{ p.status }}</span> • 
                  Featured: <span :style="{ color: p.featured ? '#1DB954' : 'rgba(255,255,255,0.4)' }">{{ p.featured ? 'Yes' : 'No' }}</span>
                </p>
              </div>
              <div>
                <button @click="toggleFeatured(p)" class="btn-action">
                  {{ p.featured ? 'Unfeature' : 'Feature' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- HIGHLIGHTS TAB -->
        <div v-if="activeTab === 'highlights'" class="glass-panel p-4">
          <h2 class="section-title">AI Highlights Review Queue</h2>
          <div v-if="highlights.length === 0" class="empty-state">No highlights detected yet.</div>
          <div v-else class="list">
            <div v-for="hl in highlights" :key="hl.id" class="list-item">
              <div class="item-info">
                <p class="item-title">{{ hl.title }}</p>
                <p class="item-meta" style="margin-top:0.25rem;">{{ hl.description || 'No description' }}</p>
                <div class="item-meta-row" style="margin-top:0.5rem;">
                  <span>Time: {{ hl.startTime }}s – {{ hl.endTime }}s</span>
                  <span>•</span>
                  <span>Conf: <span :style="{ color: hl.confidence > 0.8 ? '#1DB954' : '#f59e0b' }">{{ (hl.confidence * 100).toFixed(0) }}%</span></span>
                  <span>•</span>
                  <span>Status: <strong :style="{ color: hl.status === 'approved' ? '#1DB954' : hl.status === 'rejected' ? '#ef4444' : '#f59e0b' }">{{ hl.status }}</strong></span>
                </div>
              </div>
              <div class="action-row">
                <button v-if="hl.status !== 'approved'" @click="approveHighlight(hl.id)" class="btn-action approve">Approve</button>
                <button v-if="hl.status !== 'rejected'" @click="rejectHighlight(hl.id)" class="btn-action reject">Reject</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

body { 
  background-color: #0a0a0a; 
  color: #fff; 
  font-family: 'DM Sans', system-ui, sans-serif; 
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: rgba(29, 185, 84, 0.25);
  color: #fff;
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #000; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #1DB954; }

.app { min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 2rem; }

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

.brand-title { font-size: 2rem; font-weight: 800; letter-spacing: -0.05em; }
.accent { color: #1DB954; }
.brand-desc { color: rgba(255,255,255,0.4); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; }

.btn-primary {
  background: #1DB954; color: #000; font-weight: 700; padding: 0.75rem 1.5rem;
  border-radius: 9999px; border: none; cursor: pointer; transition: transform 0.2s, filter 0.2s;
  font-family: inherit; font-size: 0.875rem;
}
.btn-primary:hover:not(:disabled) { transform: scale(1.02); filter: brightness(1.1); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.input-field {
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff; border-radius: 8px; padding: 0.75rem 1rem; outline: none;
  transition: border-color 0.2s; font-family: inherit; width: 100%; margin-bottom: 1rem;
}
.input-field:focus { border-color: #1DB954; }

/* Auth Wrapper */
.auth-wrapper { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.login-panel { padding: 3rem; width: 100%; max-width: 400px; text-align: center; }
.login-form { display: flex; flex-direction: column; text-align: left; margin-top: 2rem; }
.error-text { color: #f87171; font-size: 0.75rem; margin-bottom: 1rem; }

/* Dashboard Header */
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
.nav-links { display: flex; gap: 1rem; align-items: center; }
.link { color: #fff; text-decoration: none; font-size: 0.875rem; opacity: 0.7; transition: opacity 0.2s; }
.link:hover { opacity: 1; }
.btn-logout { background: transparent; border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 99px; font-size: 0.75rem; cursor: pointer; }

/* Tabs */
.tabs { display: flex; gap: 0.5rem; margin-bottom: 2.5rem; }
.tab { padding: 0.5rem 1rem; border-radius: 99px; border: none; cursor: pointer; font-weight: 600; font-size: 0.875rem; transition: all 0.2s; background: transparent; color: rgba(255,255,255,0.6); font-family: inherit; }
.tab.active { background: #1DB954; color: #000; }

.alert { margin-bottom: 1.5rem; padding: 1rem; color: #1DB954; font-size: 0.875rem; border-color: rgba(29, 185, 84, 0.2); background: rgba(29, 185, 84, 0.1); cursor: pointer; }

.p-4 { padding: 2rem; }
.section-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
.empty-state { color: rgba(255,255,255,0.4); font-size: 0.875rem; }

/* Lists & Grid */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
.stat-card { padding: 1.5rem; }
.stat-label { color: rgba(255,255,255,0.4); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 0.5rem; }
.stat-value { font-size: 3rem; font-weight: 800; letter-spacing: -0.05em; }

.list { display: flex; flex-direction: column; gap: 1rem; }
.list-item { padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
.item-info { flex: 1; min-width: 0; padding-right: 1rem; }
.item-title { font-size: 1rem; font-weight: 700; color: #fff; }
.item-meta { font-size: 0.875rem; color: rgba(255,255,255,0.5); }
.item-meta-row { display: flex; gap: 0.5rem; font-size: 0.75rem; color: rgba(255,255,255,0.4); }

.action-row { display: flex; gap: 0.5rem; }
.btn-action { padding: 0.375rem 0.75rem; border-radius: 99px; border: 1px solid rgba(255,255,255,0.2); background: transparent; cursor: pointer; font-size: 0.75rem; font-weight: 600; color: #fff; transition: all 0.2s; font-family: inherit; }
.btn-action:hover { background: rgba(255,255,255,0.1); }
.btn-action.approve { border-color: rgba(29, 185, 84, 0.5); color: #1DB954; }
.btn-action.approve:hover { background: rgba(29, 185, 84, 0.1); }
.btn-action.reject { border-color: rgba(239, 68, 68, 0.5); color: #ef4444; }
.btn-action.reject:hover { background: rgba(239, 68, 68, 0.1); }
</style>
