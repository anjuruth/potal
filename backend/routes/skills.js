const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT category_id, category_name, description FROM SKILL_CATEGORY WHERE status = 'active' ORDER BY category_name");
    res.json(rows);
  } catch (err) {
    const [rows] = await db.execute('SELECT category_id, category_name FROM SKILL_CATEGORY ORDER BY category_name');
    res.json(rows);
  }
});

module.exports = router;
