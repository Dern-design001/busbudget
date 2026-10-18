// ============================================================
// server.js — Express server with Google OAuth
// Data is stored in the browser (localStorage) — no DB needed
// ============================================================
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const session    = require('express-session');
const passport   = require('./auth/passport');
const authRouter = require('./auth/routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Session (in-memory — no database required) ───────────
app.use(session({
  secret:            process.env.SESSION_SECRET || 'busbudget_secret',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    maxAge:   7 * 24 * 60 * 60 * 1000,  // 7 days
    httpOnly: true,
    sameSite: 'lax',
    // On Render (HTTPS) cookies must be secure
    secure:   process.env.NODE_ENV === 'production',
  }
}));

// ── Passport (must come after session) ───────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Serve static frontend files ───────────────────────────
app.use(express.static(path.join(__dirname)));

// ── Routes ────────────────────────────────────────────────
app.use('/auth', authRouter);

// ── Fallback ──────────────────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 BusBudget server running at http://localhost:${PORT}`);
});
