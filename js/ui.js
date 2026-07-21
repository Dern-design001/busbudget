// ============================================================
// ui.js — Theme, sidebar, tab switching, toast, modal
// ============================================================

// ── Toast notifications ────────────────────────────────────
function showToast(msg, type = 'success') {
  const c  = document.getElementById('toast-container');
  const t  = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-slate-700';
  const ic = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info';

  t.className = `${bg} text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-sm font-semibold pointer-events-auto
                 opacity-0 translate-y-2 transition-all duration-300 max-w-xs`;
  t.innerHTML = `<i class="fa-solid ${ic}"></i><span>${msg}</span>`;
  c.appendChild(t);

  setTimeout(() => t.classList.remove('opacity-0', 'translate-y-2'), 30);
  setTimeout(() => {
    t.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

// ── Dark / light theme ────────────────────────────────────
function initTheme() {
  document.documentElement.classList.toggle('dark', appState.theme === 'dark');
}

function toggleTheme() {
  appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
  initTheme();
  showToast(appState.theme === 'dark' ? 'Dark mode on' : 'Light mode on', 'info');
  save();
}

// ── Sidebar open / close ──────────────────────────────────
function toggleSidebar() {
  appState.sidebarOpen ? closeSidebar() : openSidebar();
}

function openSidebar() {
  appState.sidebarOpen = true;
  document.getElementById('sidebar').classList.remove('-translate-x-full');
  document.getElementById('sidebar').classList.add('translate-x-0');
  const bd = document.getElementById('sidebar-backdrop');
  bd.classList.remove('hidden');
  setTimeout(() => bd.classList.add('opacity-100'), 20);
}

function closeSidebar() {
  appState.sidebarOpen = false;
  document.getElementById('sidebar').classList.remove('translate-x-0');
  document.getElementById('sidebar').classList.add('-translate-x-full');
  const bd = document.getElementById('sidebar-backdrop');
  bd.classList.remove('opacity-100');
  setTimeout(() => bd.classList.add('hidden'), 300);
}

// ── Tab switching (Dashboard ↔ Entries) ───────────────────
function switchTab(tab) {
  appState.activeTab = tab;

  ['dashboard', 'entries'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('hidden', t !== tab);

    // Sidebar nav highlight
    const nav = document.getElementById(`nav-${t}`);
    if (t === tab) {
      nav.classList.add('nav-active', 'text-brand-500');
      nav.classList.remove('text-slate-600', 'dark:text-slate-300');
    } else {
      nav.classList.remove('nav-active', 'text-brand-500');
      nav.classList.add('text-slate-600', 'dark:text-slate-300');
    }

    // Bottom tab bar highlight
    const btn = document.getElementById(`tab-btn-${t}`);
    if (btn) {
      btn.classList.toggle('tab-btn-active', t === tab);
      btn.classList.toggle('text-slate-400',        t !== tab);
      btn.classList.toggle('dark:text-slate-500',   t !== tab);
    }
  });

  const titles = { dashboard: 'Dashboard', entries: 'My Entries' };
  document.getElementById('page-title').textContent = titles[tab] || '';

  if (tab === 'dashboard') renderDashboard();
  if (tab === 'entries')   renderEntryList();

  closeSidebar();
}

// ── Modal open / close ────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');

  if (id === 'addEntryModal') {
    document.getElementById('entryForm').reset();
    document.getElementById('entry-id-field').value = '';
    document.getElementById('modal-title').textContent = 'Track Daily Log';
    document.getElementById('expense-rows-container').innerHTML = '';
    document.getElementById('no-expense-state').classList.remove('hidden');
    setTodayDate();
    calculateSavingsPreview();
  }

  // On desktop — centre the modal panel
  const panel = document.getElementById('modal-panel');
  if (window.innerWidth >= 1024) {
    panel.style.cssText = 'position:relative;margin:2rem auto;border-radius:1.5rem;max-width:42rem;max-height:90vh';
  }
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.body.classList.remove('modal-open');
}
