const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT college_id, college_name, college_code, district, state FROM Colleges WHERE status = 'active' ORDER BY college_name");
    res.json(rows);
  } catch (err) {
    const [rows] = await db.execute('SELECT college_id, college_name, college_code FROM Colleges ORDER BY college_name');
    res.json(rows);
  }
});

router.get('/:id/departments', async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT department_id, department_name FROM Departments WHERE college_id = ? AND status = 'active' ORDER BY department_name",
      [req.params.id]);
    res.json(rows);
  } catch (err) {
    const [rows] = await db.execute(
      'SELECT department_id, department_name FROM Departments WHERE college_id = ? ORDER BY department_name',
      [req.params.id]);
    res.json(rows);
  }
});

module.exports = router;
