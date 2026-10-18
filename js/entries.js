// ============================================================
// entries.js — Entry list, expense rows, save / edit / delete
// Data persisted to localStorage (no server DB)
// ============================================================

// ── Render the Entries tab grid ───────────────────────────
function renderEntryList() {
  const grid  = document.getElementById('entries-grid');
  const empty = document.getElementById('entries-empty-state');
  const q     = (document.getElementById('entry-search').value || '').toLowerCase();
  const sort  = document.getElementById('entry-filter-sort').value;

  // Filter by search query
  let list = appState.entries.filter(e => {
    const d = new Date(e.date + 'T00:00:00Z')
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      .toLowerCase();
    return !q || d.includes(q) || e.date.includes(q) ||
      e.expenses.some(x => x.name.toLowerCase().includes(q) || x.category.toLowerCase().includes(q));
  });

  // Sort
  const sorters = {
    'date-desc':   (a, b) => new Date(b.date) - new Date(a.date),
    'date-asc':    (a, b) => new Date(a.date) - new Date(b.date),
    'budget-high': (a, b) => b.budget - a.budget,
    'spent-high':  (a, b) => b.spent  - a.spent,
    'saved-high':  (a, b) => b.saved  - a.saved,
  };
  list.sort(sorters[sort] || sorters['date-desc']);

  grid.innerHTML = '';
  if (!list.length) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }
  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  list.forEach(e => {
    const eff   = e.budget > 0 ? Math.round((e.saved / e.budget) * 100) : 0;
    const effTx = eff >= 50 ? 'text-emerald-500' : eff >= 20 ? 'text-amber-500' : 'text-rose-500';
    const effBg = eff >= 50 ? 'bg-emerald-500/10' : eff >= 20 ? 'bg-amber-500/10' : 'bg-rose-500/10';
    const bullet = eff >= 50 ? 'bg-emerald-500' : eff >= 20 ? 'bg-amber-500' : 'bg-rose-500';
    const d      = new Date(e.date + 'T00:00:00Z');
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    // Build expense rows inside each card
    let expHTML = '';
    if (!e.expenses.length) {
      expHTML = `<p class="text-xs text-slate-400 italic py-2 text-center">No expenses — 100% saved!</p>`;
    } else {
      e.expenses.forEach(x => {
        const m = expenseCategories[x.category] || { label: x.category, icon: 'fa-circle', color: 'bg-slate-100 text-slate-500' };
        expHTML += `
          <div class="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
            <div class="flex items-center space-x-2 min-w-0">
              <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${m.color}">
                <i class="fa-solid ${m.icon}"></i>
              </span>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">${x.name || m.label}</p>
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
            <button onclick="editEntry('${e.id}')"
              class="p-2 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors" title="Edit">
              <i class="fa-solid fa-pen-to-square text-sm"></i>
            </button>
            <button onclick="deleteEntry('${e.id}')"
              class="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors" title="Delete">
              <i class="fa-solid fa-trash text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Budget / Spent / Saved stat row -->
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

        <!-- Expense line items -->
        <div class="px-4 py-2">${expHTML}</div>

        <!-- Efficiency badge footer -->
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

// ── Expense row builder (inside Add/Edit modal) ───────────
function addExpenseRow(data = null) {
  const container = document.getElementById('expense-rows-container');
  document.getElementById('no-expense-state').classList.add('hidden');

  const id  = 'row-' + Date.now() + Math.random().toString(36).substr(2, 4);
  const div = document.createElement('div');
  div.id        = id;
  div.className = 'p-3 space-y-2';

  let opts = '';
  Object.entries(expenseCategories).forEach(([k, v]) => {
    opts += `<option value="${k}" ${data && data.category === k ? 'selected' : ''}>${v.label}</option>`;
  });

  div.innerHTML = `
    <div class="flex items-center justify-between">
      <select class="expense-row-category flex-1 mr-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600
                     rounded-xl py-2.5 px-3 text-sm text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-brand-500">
        ${opts}
      </select>
      <button type="button" onclick="removeExpenseRow('${id}')"
        class="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
    <div class="flex items-center space-x-2">
      <input type="text" value="${data ? data.name : ''}" placeholder="Description (e.g. Rice meal, bus pass...)"
        class="expense-row-name flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600
               rounded-xl py-2.5 px-3 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-1 focus:ring-brand-500">
      <div class="relative w-28 flex-shrink-0">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
        <input type="number" step="1" min="0" value="${data ? data.amount : ''}" oninput="calculateSavingsPreview()" placeholder="0"
          class="expense-row-amount w-full pl-7 pr-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600
                 rounded-xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-brand-500">
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

// ── Live savings preview in the modal ────────────────────
function calculateSavingsPreview() {
  const budget = parseFloat(document.getElementById('form-budget').value) || 0;
  let spent = 0;
  document.querySelectorAll('.expense-row-amount').forEach(i => { spent += parseFloat(i.value) || 0; });
  const net = budget - spent;

  document.getElementById('preview-total-spent').textContent = fmt(spent);
  const el = document.getElementById('preview-projected-savings');
  el.textContent = fmt(net);
  el.className   = `text-xl font-bold heading-font ${net >= 0 ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`;
}

// ── Save (create or update) an entry ─────────────────────
function saveEntry(e) {
  e.preventDefault();
  const id     = document.getElementById('entry-id-field').value;
  const date   = document.getElementById('form-date').value;
  const budget = parseFloat(document.getElementById('form-budget').value) || 0;

  const expItems = [];
  let spent = 0, hasZero = false;

  document.querySelectorAll('#expense-rows-container > div').forEach(row => {
    const cat    = row.querySelector('.expense-row-category').value;
    const name   = row.querySelector('.expense-row-name').value.trim() || 'Expense';
    const amount = parseFloat(row.querySelector('.expense-row-amount').value) || 0;
    if (amount <= 0) hasZero = true;
    expItems.push({ category: cat, name, amount });
    spent += amount;
  });

  if (hasZero) { showToast('Each expense amount must be greater than 0', 'error'); return; }

  const record = {
    id:       id || ('id-' + Date.now()),
    date,
    budget,
    expenses: expItems,
    spent,
    saved:    budget - spent,
  };

  // Read current stored entries
  let entries = loadEntriesFromStorage();

  if (id) {
    // Update existing
    const idx = entries.findIndex(x => x.id === id);
    if (idx !== -1) entries[idx] = record;
    else entries.push(record);
  } else {
    // Check for duplicate date
    if (entries.some(x => x.date === date)) {
      showToast(`An entry for ${date} already exists`, 'error');
      return;
    }
    entries.push(record);
  }

  saveEntriesToStorage(entries);
  showToast(id ? 'Entry updated' : 'Entry saved', 'success');
  closeModal('addEntryModal');
  loadEntries();
}

// ── Load an entry into the modal for editing ──────────────
function editEntry(id) {
  const entry = appState.entries.find(x => x.id === id);
  if (!entry) return;

  openModal('addEntryModal');
  document.getElementById('modal-title').textContent  = 'Edit Day Log';
  document.getElementById('entry-id-field').value     = entry.id;
  document.getElementById('form-date').value          = entry.date;
  document.getElementById('form-budget').value        = entry.budget;
  document.getElementById('expense-rows-container').innerHTML = '';

  if (entry.expenses.length) {
    document.getElementById('no-expense-state').classList.add('hidden');
    entry.expenses.forEach(x => addExpenseRow(x));
  } else {
    document.getElementById('no-expense-state').classList.remove('hidden');
  }
  calculateSavingsPreview();
}

// ── Delete an entry (with inline confirm dialog) ──────────
function deleteEntry(id) {
  const idx    = appState.entries.findIndex(x => x.id === id);
  if (idx === -1) return;
  const target = appState.entries[idx];

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';
  overlay.innerHTML = `
    <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
      <div class="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center text-xl mb-4">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3 class="font-bold heading-font text-slate-900 dark:text-white">Delete this entry?</h3>
      <p class="text-sm text-slate-400 mt-2">
        This permanently removes the log for <strong>${target.date}</strong>. Cannot be undone.
      </p>
      <div class="flex gap-3 mt-6">
        <button id="del-cancel"  class="flex-1 py-3 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl active:scale-95 transition-transform">Keep</button>
        <button id="del-confirm" class="flex-1 py-3 text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-2xl active:scale-95 transition-transform">Delete</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.querySelector('#del-cancel').onclick  = () => overlay.remove();
  overlay.querySelector('#del-confirm').onclick = () => {
    let entries = loadEntriesFromStorage();
    entries = entries.filter(x => x.id !== id);
    saveEntriesToStorage(entries);
    showToast('Entry deleted', 'error');
    overlay.remove();
    loadEntries();
  };
}
