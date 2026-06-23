const express = require('express');
const router = express.Router();
const db = require('../config/db');
const upload = require('../middleware/upload');

const getStudentId = async (userId) => {
  const [rows] = await db.execute('SELECT student_id FROM STUDENT WHERE user_id = ?', [userId]);
  return rows[0]?.student_id;
};

const calcCompletion = (u, s, skillCount) => {
  let pct = 0;
  if (u.full_name) pct += 10;
  if (u.mobile) pct += 10;
  if (u.photo) pct += 10;
  if (s?.register_no) pct += 15;
  if (s?.cgpa) pct += 15;
  if (u.department_id) pct += 10;
  if (s?.batch_id) pct += 10;
  if (u.college_id) pct += 10;
  if (skillCount > 0) pct += 10;
  return pct;
};

// GET /api/student/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.userId;
    const [[user]] = await db.execute('SELECT * FROM Users WHERE user_id = ?', [userId]);
    const [[student]] = await db.execute('SELECT * FROM STUDENT WHERE user_id = ?', [userId]);
    const studentId = student?.student_id;

    const [[{ applied_drives }]] = await db.execute(
      'SELECT COUNT(*) as applied_drives FROM DRIVE_APPLICATION WHERE student_id = ?', [studentId || 0]);

    const [[{ upcoming_exams }]] = await db.execute(
      `SELECT COUNT(*) as upcoming_exams FROM EXAM e
       JOIN EXAM_ASSIGNMENT ea ON e.exam_id = ea.exam_id
       JOIN BATCH_STUDENT bs ON ea.batch_id = bs.batch_id
       WHERE bs.student_id = ? AND e.start_time > NOW()`, [studentId || 0]);

    const [[{ unread_notifications }]] = await db.execute(
      'SELECT COUNT(*) as unread_notifications FROM NOTIFICATION WHERE user_id = ? AND is_read = 0', [userId]);

    const [recent_applications] = await db.execute(
      `SELECT da.*, p.company_name, p.job_role FROM DRIVE_APPLICATION da
       JOIN PLACEMENT p ON da.drive_id = p.drive_id
       WHERE da.student_id = ? ORDER BY da.application_date DESC LIMIT 5`, [studentId || 0]);

    const [recent_results] = await db.execute(
      `SELECT r.*, e.exam_name FROM RESULT r
       JOIN EXAM e ON r.exam_id = e.exam_id
       WHERE r.student_id = ? ORDER BY r.result_id DESC LIMIT 3`, [studentId || 0]);

    const [[{ skillCount }]] = await db.execute(
      'SELECT COUNT(*) as skillCount FROM STUDENT_SKILL WHERE student_id = ?', [studentId || 0]);

    const profile_completion = calcCompletion(user, student, skillCount);

    res.json({
      stats: { applied_drives, upcoming_exams, unread_notifications, profile_completion },
      recent_applications,
      recent_results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

// GET /api/student/profile
router.get('/profile', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.user_id, u.full_name, u.email, u.mobile, u.photo, u.role,
              u.college_id, u.department_id,
              s.student_id, s.register_no, s.cgpa, s.backlog_count,
              s.placement_status, s.batch_id,
              d.department_name, c.college_name,
              b.batch_name
       FROM Users u
       LEFT JOIN STUDENT s ON u.user_id = s.user_id
       LEFT JOIN Departments d ON u.department_id = d.department_id
       LEFT JOIN Colleges c ON CAST(u.college_id AS CHAR) = c.college_id
       LEFT JOIN BATCH b ON s.batch_id = b.batch_id
       WHERE u.user_id = ?`, [req.user.userId]);

    if (!rows.length) return res.status(404).json({ message: 'Profile not found' });

    const [[{ skillCount }]] = await db.execute(
      'SELECT COUNT(*) as skillCount FROM STUDENT_SKILL WHERE student_id = ?', [rows[0].student_id || 0]);

    const profile_completion = calcCompletion(rows[0], rows[0], skillCount);
    res.json({ ...rows[0], profile_completion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load profile' });
  }
});

// PUT /api/student/profile
router.put('/profile', upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { full_name, mobile, register_no, cgpa, backlog_count, batch_id } = req.body;
    const photo = req.file ? `/uploads/photos/${req.file.filename}` : undefined;

    const userFields = ['full_name = ?', 'mobile = ?'];
    const userValues = [full_name, mobile];
    if (photo) { userFields.push('photo = ?'); userValues.push(photo); }
    userValues.push(userId);
    await db.execute(`UPDATE Users SET ${userFields.join(', ')} WHERE user_id = ?`, userValues);

    const [students] = await db.execute('SELECT student_id FROM STUDENT WHERE user_id = ?', [userId]);
    if (students.length > 0) {
      await db.execute(
        'UPDATE STUDENT SET register_no = ?, cgpa = ?, backlog_count = ?, batch_id = ? WHERE user_id = ?',
        [register_no || null, cgpa || null, backlog_count || 0, batch_id || null, userId]
      );
      if (batch_id) {
        const [[{ cnt }]] = await db.execute(
          'SELECT COUNT(*) as cnt FROM BATCH_STUDENT WHERE student_id = ? AND batch_id = ?',
          [students[0].student_id, batch_id]);
        if (!cnt) {
          await db.execute(
            'INSERT INTO BATCH_STUDENT (batch_id, student_id, assigned_date, status) VALUES (?,?,CURDATE(),?)',
            [batch_id, students[0].student_id, 'active']);
        }
      }
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// GET /api/student/skills
router.get('/skills', async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    if (!studentId) return res.json([]);
    const [rows] = await db.execute(
      `SELECT ss.*, sk.skill_name, sk.description as skill_desc, sc.category_name
       FROM STUDENT_SKILL ss
       JOIN SKILL sk ON ss.skill_id = sk.skill_id
       JOIN SKILL_CATEGORY sc ON sk.category_id = sc.category_id
       WHERE ss.student_id = ?
       ORDER BY ss.added_date DESC`, [studentId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load skills' });
  }
});

// GET /api/student/skills/available
router.get('/skills/available', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT sk.*, sc.category_name FROM SKILL sk
       JOIN SKILL_CATEGORY sc ON sk.category_id = sc.category_id
       WHERE sk.status = 'active' ORDER BY sc.category_name, sk.skill_name`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load skills' });
  }
});

// POST /api/student/skills
router.post('/skills', upload.single('certificate_file'), async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    if (!studentId) return res.status(404).json({ message: 'Student profile not found' });
    const { skill_id } = req.body;
    const certificate_file = req.file ? `/uploads/certificates/${req.file.filename}` : null;
    await db.execute(
      'INSERT INTO STUDENT_SKILL (student_id, skill_id, certificate_file, status, added_date) VALUES (?,?,?,?,CURDATE())',
      [studentId, skill_id, certificate_file, 'pending']);
    res.status(201).json({ message: 'Skill added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add skill' });
  }
});

// PUT /api/student/skills/:id
router.put('/skills/:id', upload.single('certificate_file'), async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    const { skill_id } = req.body;
    const certificate_file = req.file ? `/uploads/certificates/${req.file.filename}` : undefined;
    const fields = ['skill_id = ?'];
    const values = [skill_id];
    if (certificate_file) { fields.push('certificate_file = ?'); values.push(certificate_file); }
    values.push(req.params.id, studentId);
    await db.execute(`UPDATE STUDENT_SKILL SET ${fields.join(', ')} WHERE student_skill_id = ? AND student_id = ?`, values);
    res.json({ message: 'Skill updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update skill' });
  }
});

// DELETE /api/student/skills/:id
router.delete('/skills/:id', async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    await db.execute('DELETE FROM STUDENT_SKILL WHERE student_skill_id = ? AND student_id = ?', [req.params.id, studentId]);
    res.json({ message: 'Skill removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove skill' });
  }
});

// GET /api/student/drives
router.get('/drives', async (req, res) => {
  try {
    const [students] = await db.execute(
      'SELECT s.*, u.department_id FROM STUDENT s JOIN Users u ON s.user_id = u.user_id WHERE s.user_id = ?',
      [req.user.userId]);
    const student = students[0];
    const studentId = student?.student_id;

    const [rows] = await db.execute(
      `SELECT p.*,
        (SELECT COUNT(*) FROM DRIVE_ELIGIBILITY de WHERE de.drive_id = p.drive_id AND de.department_id = ?) > 0 as dept_eligible,
        (SELECT COUNT(*) FROM DRIVE_APPLICATION da WHERE da.drive_id = p.drive_id AND da.student_id = ?) > 0 as already_applied
       FROM PLACEMENT p
       WHERE p.status = 'active' AND p.application_deadline >= CURDATE()
       ORDER BY p.drive_date ASC`,
      [student?.department_id || 0, studentId || 0]);

    const drives = rows.map(d => ({
      ...d,
      cgpa_eligible: !student || parseFloat(student.cgpa) >= parseFloat(d.minimum_cgpa),
      backlog_eligible: !student || (student.backlog_count || 0) <= (d.max_backlogs || 99),
      dept_eligible: d.dept_eligible === 1 || d.dept_eligible === true,
      already_applied: d.already_applied === 1 || d.already_applied === true,
    }));

    res.json(drives);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load drives' });
  }
});

// POST /api/student/drives/:driveId/apply
router.post('/drives/:driveId/apply', async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    if (!studentId) return res.status(404).json({ message: 'Student profile not found. Complete your profile first.' });

    const { driveId } = req.params;
    const [[drive]] = await db.execute('SELECT * FROM PLACEMENT WHERE drive_id = ?', [driveId]);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    if (drive.status !== 'active') return res.status(400).json({ message: 'Drive is no longer active' });
    if (new Date(drive.application_deadline) < new Date()) return res.status(400).json({ message: 'Application deadline has passed' });

    const [[student]] = await db.execute('SELECT s.*, u.department_id FROM STUDENT s JOIN Users u ON s.user_id = u.user_id WHERE s.student_id = ?', [studentId]);
    if (parseFloat(student.cgpa) < parseFloat(drive.minimum_cgpa))
      return res.status(400).json({ message: `Minimum CGPA required: ${drive.minimum_cgpa}. Your CGPA: ${student.cgpa}` });
    if ((student.backlog_count || 0) > (drive.max_backlogs || 99))
      return res.status(400).json({ message: `Maximum backlogs allowed: ${drive.max_backlogs}. Your backlogs: ${student.backlog_count}` });

    const [[{ cnt }]] = await db.execute(
      'SELECT COUNT(*) as cnt FROM DRIVE_APPLICATION WHERE drive_id = ? AND student_id = ?', [driveId, studentId]);
    if (cnt > 0) return res.status(400).json({ message: 'Already applied to this drive' });

    await db.execute(
      "INSERT INTO DRIVE_APPLICATION (drive_id, student_id, application_date, status) VALUES (?,?,CURDATE(),'applied')",
      [driveId, studentId]);

    await db.execute(
      "INSERT INTO NOTIFICATION (user_id, title, message, created_at, is_read) VALUES (?,?,?,NOW(),0)",
      [req.user.userId, `Applied to ${drive.company_name}`, `Your application for ${drive.job_role} at ${drive.company_name} has been submitted.`]);

    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to apply' });
  }
});

// GET /api/student/applications
router.get('/applications', async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    const [rows] = await db.execute(
      `SELECT da.*, p.company_name, p.job_role, p.package_lpa, p.drive_date, p.company_website
       FROM DRIVE_APPLICATION da
       JOIN PLACEMENT p ON da.drive_id = p.drive_id
       WHERE da.student_id = ?
       ORDER BY da.application_date DESC`, [studentId || 0]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load applications' });
  }
});

// GET /api/student/exams
router.get('/exams', async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    const [rows] = await db.execute(
      `SELECT DISTINCT e.*,
        (SELECT COUNT(*) FROM STUDENT_EXAM se WHERE se.exam_id = e.exam_id AND se.student_id = ?) as attempted
       FROM EXAM e
       JOIN EXAM_ASSIGNMENT ea ON e.exam_id = ea.exam_id
       JOIN BATCH_STUDENT bs ON ea.batch_id = bs.batch_id
       WHERE bs.student_id = ?
       ORDER BY e.start_time DESC`, [studentId || 0, studentId || 0]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load exams' });
  }
});

// GET /api/student/exams/:id/questions
router.get('/exams/:id/questions', async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    const [[exam]] = await db.execute('SELECT * FROM EXAM WHERE exam_id = ?', [req.params.id]);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const [[{ attempted }]] = await db.execute(
      'SELECT COUNT(*) as attempted FROM STUDENT_EXAM WHERE exam_id = ? AND student_id = ?',
      [req.params.id, studentId]);
    if (attempted > 0) return res.status(400).json({ message: 'You have already attempted this exam' });

    if (new Date(exam.start_time) > new Date()) return res.status(400).json({ message: 'Exam has not started yet' });
    if (new Date(exam.end_time) < new Date()) return res.status(400).json({ message: 'Exam has ended' });

    const [questions] = await db.execute(
      `SELECT qb.question_id, qb.question_text, qb.option_a, qb.option_b, qb.option_c, qb.option_d,
              qb.marks, qb.difficulty, qb.question_type
       FROM QUESTION_BANK qb
       JOIN EXAM_QUESTION eq ON qb.question_id = eq.question_id
       WHERE eq.exam_id = ?
       ORDER BY RAND()`, [req.params.id]);

    res.json({ exam, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load questions' });
  }
});

// POST /api/student/exams/:id/submit
router.post('/exams/:id/submit', async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    const { answers } = req.body; // { questionId: 'A'|'B'|'C'|'D' }
    const [[exam]] = await db.execute('SELECT * FROM EXAM WHERE exam_id = ?', [req.params.id]);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const [questions] = await db.execute(
      `SELECT qb.question_id, qb.correct_answer, qb.marks
       FROM QUESTION_BANK qb
       JOIN EXAM_QUESTION eq ON qb.question_id = eq.question_id
       WHERE eq.exam_id = ?`, [req.params.id]);

    let correct = 0, wrong = 0, unanswered = 0, marksObtained = 0;
    for (const q of questions) {
      const ans = answers[q.question_id];
      if (!ans) { unanswered++; }
      else if (ans === q.correct_answer) { correct++; marksObtained += q.marks; }
      else { wrong++; marksObtained -= parseFloat(exam.negative_marks || 0); }
    }
    marksObtained = Math.max(0, marksObtained);
    const percentage = questions.length ? (marksObtained / exam.total_marks) * 100 : 0;
    const result_status = marksObtained >= exam.passing_marks ? 'pass' : 'fail';
    const grade = percentage >= 90 ? 'S' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';

    const [seResult] = await db.execute(
      "INSERT INTO STUDENT_EXAM (student_id, exam_id, start_time, submit_time, status) VALUES (?,?,?,NOW(),'submitted')",
      [studentId, req.params.id, new Date(Date.now() - exam.duration * 60000)]);

    await db.execute(
      'INSERT INTO SCORE_EVALUATION (student_exam_id, correct_answers, wrong_answers, unanswered, marks_obtained, percentage, grade) VALUES (?,?,?,?,?,?,?)',
      [seResult.insertId, correct, wrong, unanswered, marksObtained, percentage.toFixed(2), grade]);

    await db.execute(
      'INSERT INTO RESULT (student_id, exam_id, obtained_marks, percentage, grade, `rank`, result_status) VALUES (?,?,?,?,?,?,?)',
      [studentId, req.params.id, marksObtained, percentage.toFixed(2), grade, 0, result_status]);

    await db.execute(
      "INSERT INTO NOTIFICATION (user_id, title, message, created_at, is_read) VALUES (?,?,?,NOW(),0)",
      [req.user.userId, `${exam.exam_name} - Result`, `You scored ${marksObtained.toFixed(1)}/${exam.total_marks} (${percentage.toFixed(1)}%) - ${result_status.toUpperCase()}`]);

    res.json({ message: 'Exam submitted!', score: marksObtained, percentage: percentage.toFixed(2), grade, result_status, correct, wrong, unanswered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit exam' });
  }
});

// GET /api/student/results
router.get('/results', async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    const [rows] = await db.execute(
      `SELECT r.*, e.exam_name, e.total_marks, e.passing_marks, e.exam_type
       FROM RESULT r JOIN EXAM e ON r.exam_id = e.exam_id
       WHERE r.student_id = ? ORDER BY r.result_id DESC`, [studentId || 0]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load results' });
  }
});

// GET /api/student/notifications
router.get('/notifications', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM NOTIFICATION WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.user.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load notifications' });
  }
});

// PUT /api/student/notifications/:id/read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    await db.execute('UPDATE NOTIFICATION SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

// POST /api/student/offline-placement
router.post('/offline-placement', upload.single('offer_letter'), async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    if (!studentId) return res.status(404).json({ message: 'Student profile not found' });
    const { company_name, job_role, package_lpa, placement_date, location } = req.body;
    const offer_path = req.file ? `/uploads/offers/${req.file.filename}` : null;
    const details = JSON.stringify({ job_role, package_lpa, location, offer_letter: offer_path });

    await db.execute(
      "INSERT INTO ACHIEVEMENT (student_id, achievement_title, achievement_details, certificate_details, achievement_type, achievement_date) VALUES (?,?,?,?,?,?)",
      [studentId, company_name, details, offer_path, 'offline_placement', placement_date || new Date().toISOString().split('T')[0]]);

    res.status(201).json({ message: 'Offline placement submitted for verification' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit' });
  }
});

// GET /api/student/achievements
router.get('/achievements', async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    const [rows] = await db.execute(
      'SELECT * FROM ACHIEVEMENT WHERE student_id = ? ORDER BY achievement_date DESC', [studentId || 0]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load achievements' });
  }
});

// POST /api/student/achievements
router.post('/achievements', upload.single('certificate'), async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.userId);
    const { achievement_title, achievement_details, achievement_type, achievement_date } = req.body;
    const cert_path = req.file ? `/uploads/certificates/${req.file.filename}` : null;
    await db.execute(
      'INSERT INTO ACHIEVEMENT (student_id, achievement_title, achievement_details, certificate_details, achievement_type, achievement_date) VALUES (?,?,?,?,?,?)',
      [studentId, achievement_title, achievement_details || null, cert_path, achievement_type || 'other', achievement_date || new Date().toISOString().split('T')[0]]);
    res.status(201).json({ message: 'Achievement added' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add achievement' });
  }
});

// GET /api/student/batches (for profile completion)
router.get('/batches', async (req, res) => {
  try {
    const [user] = await db.execute('SELECT college_id FROM Users WHERE user_id = ?', [req.user.userId]);
    const [rows] = await db.execute(
      'SELECT batch_id, batch_name FROM BATCH WHERE college_id = ? AND status = ?',
      [user[0]?.college_id, 'active']);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load batches' });
  }
});

module.exports = router;
