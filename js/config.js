// ============================================================
// config.js — App-wide constants, categories & fallback data
// ============================================================

// ── Expense category definitions ──────────────────────────
const expenseCategories = {
  'Food': { label: 'Food & Meals',  icon: 'fa-utensils',   color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  'Bus':  { label: 'Bus Travel',    icon: 'fa-bus',        color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
  'Auto': { label: 'Auto Ride',     icon: 'fa-taxi',       color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  'Bike': { label: 'Bike / Fuel',   icon: 'fa-motorcycle', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' }
};

// ── Sample / fallback data (used on first load) ────────────
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

// ── Currency formatter helpers ─────────────────────────────
const fmt = v => `₹${(+v||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtShort = v => {
  const n = +v || 0;
  if (n >= 1000) return `₹${(n/1000).toFixed(1)}k`;
  return `₹${n.toFixed(0)}`;
};
