// ============================================================
// auth/passport.js — Google OAuth strategy configuration
// ============================================================
const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool           = require('../db');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    const email    = profile.emails[0].value;
    const name     = profile.displayName;
    const avatar   = profile.photos[0]?.value || null;

    // Check if user already exists
    let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);

    if (result.rows.length === 0) {
      // First login — create the user
      result = await pool.query(
        `INSERT INTO users (google_id, email, name, avatar)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [googleId, email, name, avatar]
      );
      console.log(`New user created: ${email}`);
    } else {
      // Returning user — update name/avatar in case they changed
      result = await pool.query(
        `UPDATE users SET name=$1, avatar=$2 WHERE google_id=$3 RETURNING *`,
        [name, avatar, googleId]
      );
    }

    return done(null, result.rows[0]);
  } catch (err) {
    console.error('Passport Google strategy error:', err);
    return done(err, null);
  }
}));

// Store user id in session cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Retrieve full user from DB using session user id
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || null);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
