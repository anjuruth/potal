const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
const bcrypt = require('bcryptjs');

module.exports = (passport) => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const photo = profile.photos?.[0]?.value || null;

      const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);

      if (rows.length > 0) {
        return done(null, rows[0]);
      }

      // Create new user
      const [result] = await db.execute(
        'INSERT INTO Users (full_name, email, password, status, photo) VALUES (?, ?, ?, ?, ?)',
        [name, email, null, 'active', photo]
      );

      const [newUser] = await db.execute('SELECT * FROM Users WHERE user_id = ?', [result.insertId]);
      return done(null, newUser[0]);
    } catch (err) {
      return done(err, null);
    }
  }));
  } // end if GOOGLE_CLIENT_ID

  passport.serializeUser((user, done) => done(null, user.user_id));
  passport.deserializeUser(async (id, done) => {
    const [rows] = await db.execute('SELECT * FROM Users WHERE user_id = ?', [id]);
    done(null, rows[0]);
  });
};
