// ============================================================
// server.js — Express server with Google OAuth
// ============================================================
require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const path           = require('path');
const session        = require('express-session');
const pgSession      = require('connect-pg-simple')(session);
const passport       = require('./auth/passport');
const authRouter     = require('./auth/routes');
const entriesRouter  = require('./routes/entries');
const pool           = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: `http://localhost:${PORT}`, credentials: true }));
app.use(express.json());

// ── Session (stored in PostgreSQL) ───────────────────────
app.use(session({
  store:             new pgSession({ pool, tableName: 'session' }),
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    maxAge:   7 * 24 * 60 * 60 * 1000,  // 7 days
    httpOnly: true,
    sameSite: 'lax',
  }
}));

// ── Passport (must come after session) ───────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Serve static frontend files ───────────────────────────
app.use(express.static(path.join(__dirname)));

// ── Routes ────────────────────────────────────────────────
app.use('/auth',         authRouter);
app.use('/api/entries',  entriesRouter);

// ── Fallback ──────────────────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 BusBudget server running at http://localhost:${PORT}`);
});
