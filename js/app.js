// ============================================================
// app.js — App state, bootstrap, localStorage persistence
// ============================================================

const STORAGE_KEY = 'busbudget_entries';

let appState = {
  theme:       'light',
  activeTab:   'dashboard',
  sidebarOpen: false,
  entries:     []
};

// ── localStorage helpers ──────────────────────────────────
function loadEntriesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveEntriesToStorage(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ── Persist theme/UI prefs ────────────────────────────────
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

// ── Load entries (from localStorage) ─────────────────────
function loadEntries() {
  appState.entries = loadEntriesFromStorage().map(normalizeEntry);
  renderDashboard();
  renderEntryList();
}

// ── Normalize an entry to the expected shape ──────────────
function normalizeEntry(row) {
  return {
    id:       row.id,
    date:     (row.date || '').substring(0, 10),
    budget:   parseFloat(row.budget)  || 0,
    spent:    parseFloat(row.spent)   || 0,
    saved:    parseFloat(row.saved)   || 0,
    expenses: Array.isArray(row.expenses)
                ? row.expenses
                : JSON.parse(row.expenses || '[]')
  };
}

// ── App entry point ───────────────────────────────────────
window.onload = async function () {
  // Restore UI prefs
  const prefs = localStorage.getItem('busbudget_prefs');
  if (prefs) {
    try {
      const p        = JSON.parse(prefs);
      appState.theme     = p.theme     || 'light';
      appState.activeTab = p.activeTab || 'dashboard';
    } catch (e) {}
  }

  initTheme();
  await initAuth();   // checks Google login via /auth/me
  setTodayDate();
  loadEntries();

  window.addEventListener('resize', () => {
    if (window.innerWidth < 1024 && appState.sidebarOpen) closeSidebar();
  });
};
