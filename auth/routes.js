// ============================================================
// auth/routes.js — Login, callback, logout, current user
// ============================================================
const express  = require('express');
const passport = require('./passport');
const router   = express.Router();

// ── Start Google OAuth flow ───────────────────────────────
// Browser visits /auth/google → redirected to Google login page
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ── Google redirects back here after login ────────────────
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/?error=auth_failed' }),
  (req, res) => {
    // Success — redirect to the app
    res.redirect('/');
  }
);

// ── Logout ────────────────────────────────────────────────
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
});

// ── Current user info (called by frontend on load) ────────
// Returns logged-in user or 401 if not authenticated
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id:     req.user.id,
      name:   req.user.name,
      email:  req.user.email,
      avatar: req.user.avatar,
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router;
