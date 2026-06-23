const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const db = require('../config/db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');
const { authenticate } = require('../middleware/auth');

const signToken = (payload, expiresIn = '7d') =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { full_name, email, mobile, password, college_name, department_name, role } = req.body;
  if (!full_name || !email || !password || !role)
    return res.status(400).json({ message: 'Required fields missing' });
  try {
    const [existing] = await db.execute('SELECT user_id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email already registered' });

    // Find or create college by name (college_id is VARCHAR but Users.college_id is INTEGER — use numeric IDs)
    let college_id = null;
    if (college_name) {
      const [cols] = await db.execute('SELECT college_id FROM Colleges WHERE college_name = ?', [college_name]);
      if (cols.length > 0) {
        college_id = parseInt(cols[0].college_id) || null;
      } else {
        const [[{ maxId }]] = await db.execute('SELECT IFNULL(MAX(CAST(college_id AS UNSIGNED)), 0) + 1 AS maxId FROM Colleges');
        college_id = maxId;
        await db.execute('INSERT INTO Colleges (college_id, college_name, status) VALUES (?,?,?)', [String(college_id), college_name, 'active']);
      }
    }

    // Find or create department by name under that college
    let department_id = null;
    if (department_name) {
      const [depts] = await db.execute('SELECT department_id FROM Departments WHERE department_name = ? AND college_id = ?', [department_name, college_id]);
      if (depts.length > 0) {
        department_id = depts[0].department_id;
      } else {
        const [dr] = await db.execute('INSERT INTO Departments (college_id, department_name, status) VALUES (?,?,?)', [college_id, department_name, 'active']);
        department_id = dr.insertId;
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO Users (full_name, email, mobile, password, college_id, department_id, role, status) VALUES (?,?,?,?,?,?,?,?)',
      [full_name, email, mobile || null, hashed, college_id || null, department_id || null, role, 'pending']
    );
    const userId = result.insertId;

    if (role === 'student') {
      await db.execute(
        'INSERT INTO STUDENT (user_id, college_id, department_id, placement_status) VALUES (?,?,?,?)',
        [userId, college_id || null, department_id || null, 'not_placed']
      );
    } else if (role === 'faculty_advisor') {
      await db.execute(
        'INSERT INTO FACULTY_ADVISOR (user_id, department_id, college_id) VALUES (?,?,?)',
        [userId, department_id || null, college_id || null]
      );
    }

    const verifyToken = signToken({ userId, email, purpose: 'email_verification' }, '24h');
    try { await sendVerificationEmail(email, full_name, verifyToken); } catch (e) { console.error('Email error:', e.message); }

    res.status(201).json({ message: 'Registration successful. Please verify your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    if (!users.length) return res.status(401).json({ message: 'Invalid credentials' });
    const user = users[0];

    if (user.status === 'pending')
      return res.status(403).json({ message: 'Email not verified', code: 'EMAIL_NOT_VERIFIED' });
    if (user.status === 'inactive')
      return res.status(403).json({ message: 'Account is inactive' });

    if (!user.password)
      return res.status(401).json({ message: 'Please login with Google' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ userId: user.user_id, email: user.email, role: user.role });
    const { password: _, ...safe } = user;
    res.json({ token, user: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=google` }),
  (req, res) => {
    const user = req.user;
    const token = signToken({ userId: user.user_id, email: user.email, role: user.role });
    const userData = encodeURIComponent(JSON.stringify({
      user_id: user.user_id, full_name: user.full_name, email: user.email,
      role: user.role, status: user.status, photo: user.photo,
    }));
    res.redirect(`${process.env.FRONTEND_URL}/auth/google-callback?token=${token}&user=${userData}`);
  }
);

// GET /api/auth/verify-email?token=...
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== 'email_verification')
      return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=invalid_token`);

    await db.execute("UPDATE Users SET status = 'active' WHERE user_id = ?", [payload.userId]);
    res.redirect(`${process.env.FRONTEND_URL}/auth/login?verified=true`);
  } catch {
    res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=expired_token`);
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    if (!users.length) return res.status(404).json({ message: 'User not found' });
    const user = users[0];
    if (user.status === 'active') return res.status(400).json({ message: 'Already verified' });
    const verifyToken = signToken({ userId: user.user_id, email, purpose: 'email_verification' }, '24h');
    await sendVerificationEmail(email, user.full_name, verifyToken);
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    if (!users.length) return res.json({ message: 'If the email exists, a reset link has been sent.' });
    const user = users[0];
    const resetToken = signToken({ userId: user.user_id, email, purpose: 'password_reset' }, '1h');
    await sendPasswordResetEmail(email, user.full_name, resetToken);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== 'password_reset')
      return res.status(400).json({ message: 'Invalid token' });
    const hashed = await bcrypt.hash(password, 10);
    await db.execute('UPDATE Users SET password = ? WHERE user_id = ?', [hashed, payload.userId]);
    res.json({ message: 'Password reset successful' });
  } catch {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT user_id, full_name, email, mobile, role, status, photo, college_id, department_id FROM Users WHERE user_id = ?', [req.user.userId]);
    if (!users.length) return res.status(404).json({ message: 'User not found' });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// POST /api/auth/select-role
router.post('/select-role', authenticate, async (req, res) => {
  const { role, college_id, department_id } = req.body;
  const validRoles = ['student', 'faculty_advisor', 'placement_officer', 'higher_authority', 'super_admin'];
  if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
  try {
    await db.execute('UPDATE Users SET role = ?, college_id = ?, department_id = ? WHERE user_id = ?',
      [role, college_id || null, department_id || null, req.user.userId]);

    if (role === 'student') {
      const [existing] = await db.execute('SELECT student_id FROM STUDENT WHERE user_id = ?', [req.user.userId]);
      if (!existing.length) {
        await db.execute('INSERT INTO STUDENT (user_id, college_id, department_id, placement_status) VALUES (?,?,?,?)',
          [req.user.userId, college_id || null, department_id || null, 'not_placed']);
      }
    }

    const [users] = await db.execute('SELECT user_id, full_name, email, role, status, photo FROM Users WHERE user_id = ?', [req.user.userId]);
    const token = signToken({ userId: users[0].user_id, email: users[0].email, role: users[0].role });
    res.json({ token, user: users[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update role' });
  }
});

module.exports = router;
