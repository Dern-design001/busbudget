// ============================================================
// app.js — App state, bootstrap, API communication
// ============================================================

const API = '/api/entries';

let appState = {
  theme:       'light',
  activeTab:   'dashboard',
  sidebarOpen: false,
  entries:     []
};

// ── Persist theme/UI prefs to localStorage (not entries) ──
function savePrefs() {
  localStorage.setItem('busbudget_prefs', JSON.stringify({
    theme:     appState.theme,
    activeTab: appState.activeTab
  }));
}

// ── Set today's date in the form date picker ──────────────
function setTodayDate() {
  const d   = new Date();
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  document.getElementById('form-date').value = `${y}-${m}-${day}`;
}

// ── Load all entries from the server ─────────────────────
async function loadEntries() {
  try {
    const res  = await fetch(API);
    const data = await res.json();
    // Normalize: expenses comes back as a parsed array from JSONB
    appState.entries = data.map(normalizeEntry);
    renderDashboard();
    renderEntryList();
  } catch (err) {
    console.error('Failed to load entries:', err);
    showToast('Could not reach server', 'error');
  }
}

// ── Normalize a DB row to match the frontend shape ────────
function normalizeEntry(row) {
  return {
    id:       row.id,
    date:     row.date.substring(0, 10),   // strip timestamp
    budget:   parseFloat(row.budget),
    spent:    parseFloat(row.spent),
    saved:    parseFloat(row.saved),
    expenses: Array.isArray(row.expenses) ? row.expenses : JSON.parse(row.expenses || '[]')
  };
}

// ── App entry point ───────────────────────────────────────
window.onload = async function () {
  // Restore UI prefs
  const prefs = localStorage.getItem('busbudget_prefs');
  if (prefs) {
    try {
      const p = JSON.parse(prefs);
      appState.theme     = p.theme     || 'light';
      appState.activeTab = p.activeTab || 'dashboard';
    } catch (e) {}
  }

  initTheme();
  initAuth();
  setTodayDate();
  await loadEntries();

  window.addEventListener('resize', () => {
    if (window.innerWidth < 1024 && appState.sidebarOpen) closeSidebar();
  });
};
