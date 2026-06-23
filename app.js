// ============================================================
// BusBudget — app.js  (mobile-first rewrite)
// ============================================================

let appState = {
  theme: 'light',
  activeTab: 'dashboard',
  sidebarOpen: false,
  entries: []
};

const expenseCategories = {
  'Food': { label: 'Food & Meals',     icon: 'fa-utensils',   color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  'Bus':  { label: 'Bus Travel',       icon: 'fa-bus',        color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
  'Auto': { label: 'Auto Ride',        icon: 'fa-taxi',       color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  'Bike': { label: 'Bike / Fuel',      icon: 'fa-motorcycle', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' }
};

const fallbackDatabase = [
  { id:'1', date:'2026-06-23', budget:2000,
    expenses:[{category:'Food',amount:450,name:'Premium Diner Lunch'},{category:'Bus',amount:50,name:'Daily Shuttle'},{category:'Auto',amount:150,name:'Metro to home'}],
    spent:650, saved:1350 },
  { id:'2', date:'2026-06-22', budget:1500,
    expenses:[{category:'Food',amount:350,name:'Diner Thali Meal'},{category:'Bike',amount:480,name:'Weekly petrol refuel'}],
    spent:830, saved:670 },
  { id:'3', date:'2026-06-21', budget:3500,
    expenses:[{category:'Auto',amount:800,name:'Long city ride'},{category:'Food',amount:650,name:'Fresh Fruits & groceries'},{category:'Bus',amount:120,name:'Return express bus'}],
    spent:1570, saved:1930 },
  { id:'4', date:'2026-06-20', budget:1200,
    expenses:[{category:'Food',amount:200,name:'South Indian Breakfast'},{category:'Auto',amount:150,name:'Local shuttle fare'}],
    spent:350, saved:850 },
  { id:'5', date:'2026-06-19', budget:2500,
    expenses:[{category:'Bike',amount:600,name:'Chain lube & petrol'},{category:'Food',amount:800,name:'Dinner with colleagues'}],
    spent:1400, saved:1100 },
  { id:'6', date:'2026-06-18', budget:1800,
    expenses:[{category:'Food',amount:150,name:'Office tea & snacks'},{category:'Bus',amount:80,name:'Regular commute'}],
    spent:230, saved:1570 },
  { id:'7', date:'2026-06-17', budget:2200,
    expenses:[{category:'Bike',amount:350,name:'Petrol refill'},{category:'Food',amount:750,name:'Weekend Pizza Delivery'}],
    spent:1100, saved:1100 }
];

// ── helpers ──────────────────────────────────────────────────
const fmt = v => `\u20B9${(+v||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtShort = v => {
  const n = +v || 0;
  if (n >= 1000) return `\u20B9${(n/1000).toFixed(1)}k`;
  return `\u20B9${n.toFixed(0)}`;
};

// ── init ─────────────────────────────────────────────────────
window.onload = function () {
  const saved = localStorage.getItem('busbudget_v2');
  if (saved) {
    try { appState = JSON.parse(saved); } catch(e) { appState.entries = fallbackDatabase; }
  } else {
    appState.entries = fallbackDatabase;
    save();
  }

  initTheme();
  renderDashboard();
  renderEntryList();
  setTodayDate();

  // resize: close sidebar if going mobile
  window.addEventListener('resize', () => {
    if (window.innerWidth < 1024 && appState.sidebarOpen) closeSidebar();
  });
};

function save() { localStorage.setItem('busbudget_v2', JSON.stringify(appState)); }
function setTodayDate() {
  const d = new Date();
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  document.getElementById('form-date').value = `${y}-${m}-${day}`;
}

// ── toast ─────────────────────────────────────────────────────
function showToast(msg, type='success') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  const bg = type==='success'?'bg-emerald-500':type==='error'?'bg-rose-500':'bg-slate-700';
  const ic = type==='success'?'fa-check-circle':type==='error'?'fa-triangle-exclamation':'fa-circle-info';
  t.className = `${bg} text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-sm font-semibold pointer-events-auto
                 opacity-0 translate-y-2 transition-all duration-300 max-w-xs`;
  t.innerHTML = `<i class="fa-solid ${ic}"></i><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.classList.remove('opacity-0','translate-y-2'), 30);
  setTimeout(() => { t.classList.add('opacity-0','translate-y-2'); setTimeout(()=>t.remove(),300); }, 2800);
}

// ── theme ─────────────────────────────────────────────────────
function initTheme() {
  document.documentElement.classList.toggle('dark', appState.theme === 'dark');
}
function toggleTheme() {
  appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
  initTheme();
  showToast(appState.theme === 'dark' ? 'Dark mode on' : 'Light mode on', 'info');
  save();
}

// ── sidebar ───────────────────────────────────────────────────
function toggleSidebar() { appState.sidebarOpen ? closeSidebar() : openSidebar(); }
function openSidebar() {
  appState.sidebarOpen = true;
  document.getElementById('sidebar').classList.remove('-translate-x-full');
  document.getElementById('sidebar').classList.add('translate-x-0');
  const bd = document.getElementById('sidebar-backdrop');
  bd.classList.remove('hidden'); setTimeout(()=>bd.classList.add('opacity-100'),20);
}
function closeSidebar() {
  appState.sidebarOpen = false;
  document.getElementById('sidebar').classList.remove('translate-x-0');
  document.getElementById('sidebar').classList.add('-translate-x-full');
  const bd = document.getElementById('sidebar-backdrop');
  bd.classList.remove('opacity-100');
  setTimeout(()=>bd.classList.add('hidden'),300);
}

// ── tab switching ─────────────────────────────────────────────
function switchTab(tab) {
  appState.activeTab = tab;
  ['dashboard','entries'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('hidden', t !== tab);
    // sidebar nav
    const nav = document.getElementById(`nav-${t}`);
    if (t === tab) { nav.classList.add('nav-active','text-brand-500'); nav.classList.remove('text-slate-600','dark:text-slate-300'); }
    else           { nav.classList.remove('nav-active','text-brand-500'); nav.classList.add('text-slate-600','dark:text-slate-300'); }
    // bottom tab bar
    const btn = document.getElementById(`tab-btn-${t}`);
    if (btn) {
      btn.classList.toggle('tab-btn-active', t === tab);
      btn.classList.toggle('text-slate-400',  t !== tab);
      btn.classList.toggle('dark:text-slate-500', t !== tab);
    }
  });
  const titles = { dashboard: 'Dashboard', entries: 'My Entries' };
  document.getElementById('page-title').textContent = titles[tab] || '';
  if (tab === 'dashboard') renderDashboard();
  if (tab === 'entries')   renderEntryList();
  closeSidebar();
}

// ── dashboard ─────────────────────────────────────────────────
function renderDashboard() {
  const sorted = [...appState.entries].sort((a,b)=>new Date(b.date)-new Date(a.date));
  let tBudget=0, tSpent=0, tSaved=0;
  sorted.forEach(e=>{ tBudget+=+e.budget||0; tSpent+=+e.spent||0; tSaved+=+e.saved||0; });
  const rate = tBudget>0 ? Math.round((tSaved/tBudget)*100) : 0;

  document.getElementById('stat-budget').textContent = fmtShort(tBudget);
  document.getElementById('stat-spent').textContent  = fmtShort(tSpent);
  document.getElementById('stat-saved').textContent  = fmtShort(tSaved);
  document.getElementById('stat-net').textContent    = fmtShort(tBudget-tSpent);

  const rateEl = document.getElementById('stat-percentage');
  rateEl.textContent  = `${rate}% rate`;
  rateEl.className    = `text-[10px] font-semibold mt-0.5 ${rate>=50?'text-emerald-500':rate>=20?'text-amber-500':'text-rose-500'}`;

  const netSub = document.getElementById('stat-net-sub');
  const net = tBudget - tSpent;
  netSub.textContent = net >= 0 ? 'Positive ✓' : 'Deficit ⚠';
  netSub.className   = `text-[10px] mt-0.5 relative z-10 font-semibold ${net>=0?'text-white/70':'text-rose-200 animate-pulse'}`;

  // Recent logs — mobile card list
  const list = document.getElementById('recent-logs-list');
  list.innerHTML = '';
  const slice = sorted.slice(0, 5);
  if (!slice.length) {
    list.innerHTML = '<p class="text-center text-xs text-slate-400 py-8">No records yet. Add your first log!</p>';
    return;
  }
  slice.forEach(log => {
    const eff  = log.budget>0 ? Math.round((log.saved/log.budget)*100) : 0;
    const effCl = eff>=50 ? 'text-emerald-500' : eff>=20 ? 'text-amber-500' : 'text-rose-500';
    const d = new Date(log.date+'T00:00:00Z');
    const dateStr = d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    const cats = [...new Set(log.expenses.map(e=>e.category))];
    const catIcons = cats.map(c=>`<i class="fa-solid ${expenseCategories[c]?.icon||'fa-circle'} text-[10px]"></i>`).join(' ');

    list.innerHTML += `
      <div class="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer" onclick="switchTab('entries')">
        <div class="min-w-0">
          <p class="text-xs font-bold text-slate-800 dark:text-white">${dateStr}</p>
          <p class="text-[10px] text-slate-400 mt-0.5 space-x-1">${catIcons} <span>${cats.join(', ')}</span></p>
        </div>
        <div class="text-right flex-shrink-0 ml-3">
          <p class="text-xs font-bold text-rose-500">${fmt(log.spent)} spent</p>
          <p class="text-[10px] font-bold ${effCl}">${eff}% saved</p>
        </div>
      </div>`;
  });
}

// ── entries list ──────────────────────────────────────────────
function renderEntryList() {
  const grid  = document.getElementById('entries-grid');
  const empty = document.getElementById('entries-empty-state');
  const q     = (document.getElementById('entry-search').value||'').toLowerCase();
  const sort  = document.getElementById('entry-filter-sort').value;

  let list = appState.entries.filter(e => {
    const d = new Date(e.date+'T00:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}).toLowerCase();
    return !q || d.includes(q) || e.date.includes(q) ||
           e.expenses.some(x => x.name.toLowerCase().includes(q) || x.category.toLowerCase().includes(q));
  });

  const sorters = {
    'date-desc':(a,b)=>new Date(b.date)-new Date(a.date),
    'date-asc': (a,b)=>new Date(a.date)-new Date(b.date),
    'budget-high':(a,b)=>b.budget-a.budget,
    'spent-high': (a,b)=>b.spent-a.spent,
    'saved-high': (a,b)=>b.saved-a.saved,
  };
  list.sort(sorters[sort]||sorters['date-desc']);

  grid.innerHTML = '';
  if (!list.length) { grid.classList.add('hidden'); empty.classList.remove('hidden'); return; }
  grid.classList.remove('hidden'); empty.classList.add('hidden');

  list.forEach(e => {
    const eff  = e.budget>0 ? Math.round((e.saved/e.budget)*100) : 0;
    const effTx = eff>=50?'text-emerald-500':eff>=20?'text-amber-500':'text-rose-500';
    const effBg = eff>=50?'bg-emerald-500/10':eff>=20?'bg-amber-500/10':'bg-rose-500/10';
    const bullet = eff>=50?'bg-emerald-500':eff>=20?'bg-amber-500':'bg-rose-500';
    const d = new Date(e.date+'T00:00:00Z');
    const dateStr = d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});

    let expHTML = '';
    if (!e.expenses.length) {
      expHTML = `<p class="text-xs text-slate-400 italic py-2 text-center">No expenses — 100% saved!</p>`;
    } else {
      e.expenses.forEach(x => {
        const m = expenseCategories[x.category]||{label:x.category,icon:'fa-circle',color:'bg-slate-100 text-slate-500'};
        expHTML += `
          <div class="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
            <div class="flex items-center space-x-2 min-w-0">
              <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${m.color}"><i class="fa-solid ${m.icon}"></i></span>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">${x.name||m.label}</p>
                <p class="text-[9px] text-slate-400">${m.label}</p>
              </div>
            </div>
            <span class="text-xs font-bold text-slate-900 dark:text-white flex-shrink-0 ml-2">${fmt(x.amount)}</span>
          </div>`;
      });
    }

    grid.innerHTML += `
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-premium active:shadow-md transition-shadow">
        <!-- Card header -->
        <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Day Statement</p>
            <p class="text-sm font-bold heading-font text-slate-900 dark:text-white mt-0.5">${dateStr}</p>
          </div>
          <div class="flex space-x-1">
            <button onclick="editEntry('${e.id}')" class="p-2 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors" title="Edit">
              <i class="fa-solid fa-pen-to-square text-sm"></i>
            </button>
            <button onclick="deleteEntry('${e.id}')" class="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors" title="Delete">
              <i class="fa-solid fa-trash text-sm"></i>
            </button>
          </div>
        </div>
        <!-- Stat row -->
        <div class="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
          <div class="py-3 text-center">
            <p class="text-[9px] text-slate-400 font-bold uppercase">Budget</p>
            <p class="text-sm font-bold text-indigo-500 mt-0.5">${fmt(e.budget)}</p>
          </div>
          <div class="py-3 text-center">
            <p class="text-[9px] text-slate-400 font-bold uppercase">Spent</p>
            <p class="text-sm font-bold text-rose-500 mt-0.5">${fmt(e.spent)}</p>
          </div>
          <div class="py-3 text-center">
            <p class="text-[9px] text-slate-400 font-bold uppercase">Saved</p>
            <p class="text-sm font-bold text-emerald-500 mt-0.5">${fmt(e.saved)}</p>
          </div>
        </div>
        <!-- Expenses -->
        <div class="px-4 py-2">${expHTML}</div>
        <!-- Footer badge -->
        <div class="px-4 pb-3 flex items-center justify-between">
          <span class="text-[10px] text-slate-400">Efficiency</span>
          <div class="flex items-center space-x-1.5 px-3 py-1 rounded-full ${effBg} ${effTx} text-[11px] font-bold">
            <span class="w-1.5 h-1.5 rounded-full ${bullet} animate-pulse"></span>
            <span>${eff}% saved</span>
          </div>
        </div>
      </div>`;
  });
}

// ── expense rows ──────────────────────────────────────────────
function addExpenseRow(data=null) {
  const container = document.getElementById('expense-rows-container');
  document.getElementById('no-expense-state').classList.add('hidden');

  const id  = 'row-' + Date.now() + Math.random().toString(36).substr(2,4);
  const div = document.createElement('div');
  div.id        = id;
  div.className = 'p-3 space-y-2';

  let opts = '';
  Object.entries(expenseCategories).forEach(([k,v])=>{
    opts += `<option value="${k}" ${data&&data.category===k?'selected':''}>${v.label}</option>`;
  });

  // Stacked layout: category select full width, then name + amount in a row
  div.innerHTML = `
    <div class="flex items-center justify-between">
      <select class="expense-row-category flex-1 mr-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl py-2.5 px-3 text-sm text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-brand-500">${opts}</select>
      <button type="button" onclick="removeExpenseRow('${id}')" class="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
    <div class="flex items-center space-x-2">
      <input type="text" value="${data?data.name:''}" placeholder="Description (e.g. Rice meal, bus pass...)"
        class="expense-row-name flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl py-2.5 px-3 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-1 focus:ring-brand-500">
      <div class="relative w-28 flex-shrink-0">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">\u20B9</span>
        <input type="number" step="1" min="0" value="${data?data.amount:''}" oninput="calculateSavingsPreview()" placeholder="0"
          class="expense-row-amount w-full pl-7 pr-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-brand-500">
      </div>
    </div>`;

  container.appendChild(div);
  calculateSavingsPreview();
}

function removeExpenseRow(id) {
  document.getElementById(id)?.remove();
  if (!document.getElementById('expense-rows-container').children.length) {
    document.getElementById('no-expense-state').classList.remove('hidden');
  }
  calculateSavingsPreview();
}

function calculateSavingsPreview() {
  const budget = parseFloat(document.getElementById('form-budget').value)||0;
  let spent = 0;
  document.querySelectorAll('.expense-row-amount').forEach(i=>{ spent += parseFloat(i.value)||0; });
  const net = budget - spent;
  document.getElementById('preview-total-spent').textContent = fmt(spent);
  const el = document.getElementById('preview-projected-savings');
  el.textContent = fmt(net);
  el.className   = `text-xl font-bold heading-font ${net>=0?'text-emerald-500':'text-rose-500 animate-pulse'}`;
}

// ── modal ─────────────────────────────────────────────────────
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
  // Position modal panel for desktop (centered) vs mobile (bottom)
  const panel = document.getElementById('modal-panel');
  if (window.innerWidth >= 1024) {
    panel.style.cssText = 'position:relative;margin:2rem auto;border-radius:1.5rem;max-width:42rem;max-height:90vh';
  }
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.body.classList.remove('modal-open');
}

// ── save / edit / delete ──────────────────────────────────────
function saveEntry(e) {
  e.preventDefault();
  const id     = document.getElementById('entry-id-field').value;
  const date   = document.getElementById('form-date').value;
  const budget = parseFloat(document.getElementById('form-budget').value)||0;

  const expItems = [];
  let spent = 0, hasZero = false;
  document.querySelectorAll('#expense-rows-container > div').forEach(row => {
    const cat    = row.querySelector('.expense-row-category').value;
    const name   = row.querySelector('.expense-row-name').value.trim()||'Expense';
    const amount = parseFloat(row.querySelector('.expense-row-amount').value)||0;
    if (amount <= 0) hasZero = true;
    expItems.push({category:cat, name, amount});
    spent += amount;
  });

  if (hasZero) { showToast('Each expense amount must be greater than 0', 'error'); return; }

  const record = { id: id||('id-'+Date.now()), date, budget, expenses:expItems, spent, saved:budget-spent };

  if (id) {
    const idx = appState.entries.findIndex(x=>x.id===id);
    if (idx !== -1) appState.entries[idx] = record;
    showToast('Entry updated', 'success');
  } else {
    if (appState.entries.some(x=>x.date===date)) {
      showToast(`Entry for ${date} already exists`, 'error'); return;
    }
    appState.entries.push(record);
    showToast('Entry saved', 'success');
  }

  save();
  closeModal('addEntryModal');
  renderDashboard();
  if (appState.activeTab === 'entries') renderEntryList();
}

function editEntry(id) {
  const entry = appState.entries.find(x=>x.id===id);
  if (!entry) return;
  openModal('addEntryModal');
  document.getElementById('modal-title').textContent   = 'Edit Day Log';
  document.getElementById('entry-id-field').value      = entry.id;
  document.getElementById('form-date').value           = entry.date;
  document.getElementById('form-budget').value         = entry.budget;
  document.getElementById('expense-rows-container').innerHTML = '';
  if (entry.expenses.length) {
    document.getElementById('no-expense-state').classList.add('hidden');
    entry.expenses.forEach(x=>addExpenseRow(x));
  } else {
    document.getElementById('no-expense-state').classList.remove('hidden');
  }
  calculateSavingsPreview();
}

function deleteEntry(id) {
  const idx    = appState.entries.findIndex(x=>x.id===id);
  if (idx===-1) return;
  const target = appState.entries[idx];

  // Inline confirm dialog
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';
  overlay.innerHTML = `
    <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
      <div class="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center text-xl mb-4">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3 class="font-bold heading-font text-slate-900 dark:text-white">Delete this entry?</h3>
      <p class="text-sm text-slate-400 mt-2">This permanently removes the log for <strong>${target.date}</strong>. Cannot be undone.</p>
      <div class="flex gap-3 mt-6">
        <button id="del-cancel" class="flex-1 py-3 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl active:scale-95 transition-transform">Keep</button>
        <button id="del-confirm" class="flex-1 py-3 text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-2xl active:scale-95 transition-transform">Delete</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('#del-cancel').onclick  = () => overlay.remove();
  overlay.querySelector('#del-confirm').onclick = () => {
    appState.entries.splice(idx,1);
    save(); renderDashboard(); renderEntryList();
    showToast('Entry deleted', 'error');
    overlay.remove();
  };
}
