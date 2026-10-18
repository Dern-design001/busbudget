// ============================================================
// auth/passport.js — Google OAuth (no database)
// User profile from Google is stored directly in the session.
// ============================================================
const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
},
(accessToken, refreshToken, profile, done) => {
  // Build a plain user object from the Google profile — no DB needed
  const user = {
    id:     profile.id,                        // Google ID
    name:   profile.displayName,
    email:  profile.emails[0].value,
    avatar: profile.photos[0]?.value || null,
  };
  return done(null, user);
}));

// Store the full user object in the session (no DB lookup needed)
passport.serializeUser((user, done) => {
  done(null, user);
});

// Restore user directly from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
