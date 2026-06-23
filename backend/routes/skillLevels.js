const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT skill_level_id, level_name, description FROM SKILL_LEVEL ORDER BY skill_level_id');
    res.json(rows);
  } catch (err) {
    res.json([
      { skill_level_id: 1, level_name: 'Beginner' },
      { skill_level_id: 2, level_name: 'Intermediate' },
      { skill_level_id: 3, level_name: 'Advanced' },
      { skill_level_id: 4, level_name: 'Expert' },
    ]);
  }
});

module.exports = router;
