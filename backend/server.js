require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'placecell-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 },
}));

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { authenticate } = require('./middleware/auth');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', authenticate, require('./routes/student'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/skill-categories', require('./routes/skills'));
app.use('/api/skill-levels', require('./routes/skillLevels'));

app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

app.listen(PORT, () => console.log(`PlaceCell backend running on port ${PORT}`));

// Prevent crashes from unhandled errors
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err.message));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
