// ============================================================
// dashboard.js — Render the Dashboard tab (stats + recent logs)
// ============================================================

function renderDashboard() {
  const sorted = [...appState.entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  // ── Totals ──
  let tBudget = 0, tSpent = 0, tSaved = 0;
  sorted.forEach(e => { tBudget += +e.budget || 0; tSpent += +e.spent || 0; tSaved += +e.saved || 0; });
  const rate = tBudget > 0 ? Math.round((tSaved / tBudget) * 100) : 0;

  // ── Stat cards ──
  document.getElementById('stat-budget').textContent = fmtShort(tBudget);
  document.getElementById('stat-spent').textContent  = fmtShort(tSpent);
  document.getElementById('stat-saved').textContent  = fmtShort(tSaved);
  document.getElementById('stat-net').textContent    = fmtShort(tBudget - tSpent);

  const rateEl = document.getElementById('stat-percentage');
  rateEl.textContent = `${rate}% rate`;
  rateEl.className   = `text-[10px] font-semibold mt-0.5 ${rate >= 50 ? 'text-emerald-500' : rate >= 20 ? 'text-amber-500' : 'text-rose-500'}`;

  const netSub = document.getElementById('stat-net-sub');
  const net    = tBudget - tSpent;
  netSub.textContent = net >= 0 ? 'Positive ✓' : 'Deficit ⚠';
  netSub.className   = `text-[10px] mt-0.5 relative z-10 font-semibold ${net >= 0 ? 'text-white/70' : 'text-rose-200 animate-pulse'}`;

  // ── Recent logs list (top 5) ──
  const list  = document.getElementById('recent-logs-list');
  list.innerHTML = '';
  const slice = sorted.slice(0, 5);

  if (!slice.length) {
    list.innerHTML = '<p class="text-center text-xs text-slate-400 py-8">No records yet. Add your first log!</p>';
    return;
  }

  slice.forEach(log => {
    const eff    = log.budget > 0 ? Math.round((log.saved / log.budget) * 100) : 0;
    const effCl  = eff >= 50 ? 'text-emerald-500' : eff >= 20 ? 'text-amber-500' : 'text-rose-500';
    const d      = new Date(log.date + 'T00:00:00Z');
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const cats   = [...new Set(log.expenses.map(e => e.category))];
    const catIcons = cats.map(c => `<i class="fa-solid ${expenseCategories[c]?.icon || 'fa-circle'} text-[10px]"></i>`).join(' ');

    list.innerHTML += `
      <div class="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50
                  active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer"
           onclick="switchTab('entries')">
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
