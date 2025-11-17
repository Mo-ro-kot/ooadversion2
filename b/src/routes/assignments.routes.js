import { Router } from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

async function isTeacher(userId) {
  const [[t]] = await pool.query(
    "SELECT user_id FROM teachers WHERE user_id = ?",
    [userId]
  );
  return !!t;
}
async function isStudent(userId) {
  const [[s]] = await pool.query(
    "SELECT user_id FROM students WHERE user_id = ?",
    [userId]
  );
  return !!s;
}

router.get("/classes/:classId/assignments", requireAuth, async (req, res) => {
  const { classId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM assignments WHERE class_id = ? ORDER BY (due_at IS NULL), due_at DESC",
      [classId]
    );
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

router.post("/classes/:classId/assignments", requireAuth, async (req, res) => {
  const { userId } = req.user;
  if (!(await isTeacher(userId)))
    return res.status(403).json({ error: "Forbidden" });
  const { classId } = req.params;
  const { title, description, due_at, file_url, file_name, possible_score } =
    req.body || {};
  if (!title) return res.status(400).json({ error: "Title required" });
  try {
    const [result] = await pool.query(
      "INSERT INTO assignments (class_id, title, description, due_at, file_url, file_name, possible_score, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        classId,
        title,
        description || null,
        due_at || null,
        file_url || null,
        file_name || null,
        possible_score || 100,
        userId,
      ]
    );
    const [[row]] = await pool.query("SELECT * FROM assignments WHERE id = ?", [
      result.insertId,
    ]);
    return res.status(201).json(row);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create assignment" });
  }
});

router.get("/assignments/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [[row]] = await pool.query("SELECT * FROM assignments WHERE id = ?", [
      id,
    ]);
    if (!row) return res.status(404).json({ error: "Assignment not found" });
    return res.json(row);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch assignment" });
  }
});

// Student: fetch own submission for status display
router.get("/assignments/:id/my-submission", requireAuth, async (req, res) => {
  const { userId } = req.user;
  try {
    const [[row]] = await pool.query(
      "SELECT id, assignment_id, student_id, submitted_at, text as text_answer, file_url, file_name, grade, feedback FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?",
      [req.params.id, userId]
    );
    return res.json(row || null);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch submission" });
  }
});

router.post("/assignments/:id/submissions", requireAuth, async (req, res) => {
  const { userId } = req.user;
  if (!(await isStudent(userId)))
    return res.status(403).json({ error: "Forbidden" });
  const { id } = req.params;
  const { text_answer, file_url, file_name } = req.body || {};
  try {
    // Upsert: one submission per student per assignment
    const [existingRows] = await pool.query(
      "SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?",
      [id, userId]
    );
    if (existingRows.length) {
      const submissionId = existingRows[0].id;
      await pool.query(
        "UPDATE assignment_submissions SET text = ?, file_url = ?, file_name = ?, submitted_at = NOW() WHERE id = ?",
        [text_answer || null, file_url || null, file_name || null, submissionId]
      );
      const [[updated]] = await pool.query(
        "SELECT * FROM assignment_submissions WHERE id = ?",
        [submissionId]
      );
      return res.json(updated);
    }
    const [result] = await pool.query(
      "INSERT INTO assignment_submissions (assignment_id, student_id, text, file_url, file_name, submitted_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [id, userId, text_answer || null, file_url || null, file_name || null]
    );
    const [[row]] = await pool.query(
      "SELECT * FROM assignment_submissions WHERE id = ?",
      [result.insertId]
    );
    return res.status(201).json(row);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to submit assignment" });
  }
});

router.get("/assignments/:id/submissions", requireAuth, async (req, res) => {
  const { userId } = req.user;
  if (!(await isTeacher(userId)))
    return res.status(403).json({ error: "Forbidden" });
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT s.*, u.full_name, u.email, u.username FROM assignment_submissions s JOIN users u ON u.id = s.student_id WHERE s.assignment_id = ?",
      [id]
    );
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

router.put(
  "/assignments/:id/submissions/:submissionId/grade",
  requireAuth,
  async (req, res) => {
    const { userId } = req.user;
    if (!(await isTeacher(userId)))
      return res.status(403).json({ error: "Forbidden" });
    const { submissionId } = req.params;
    const { grade, feedback } = req.body || {};
    try {
      await pool.query(
        "UPDATE assignment_submissions SET grade = ?, feedback = ? WHERE id = ?",
        [grade ?? null, feedback ?? null, submissionId]
      );
      const [[row]] = await pool.query(
        "SELECT * FROM assignment_submissions WHERE id = ?",
        [submissionId]
      );
      return res.json(row);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to grade submission" });
    }
  }
);

// Delete assignment
router.delete("/assignments/:id", requireAuth, async (req, res) => {
  const { userId } = req.user;
  if (!(await isTeacher(userId)))
    return res.status(403).json({ error: "Forbidden" });
  const { id } = req.params;
  try {
    const [[assignment]] = await pool.query(
      "SELECT * FROM assignments WHERE id = ?",
      [id]
    );
    if (!assignment)
      return res.status(404).json({ error: "Assignment not found" });

    // Verify teacher owns this assignment's class
    const [[cls]] = await pool.query(
      "SELECT teacher_id FROM classes WHERE id = ?",
      [assignment.class_id]
    );
    if (!cls || cls.teacher_id !== userId)
      return res.status(403).json({ error: "Forbidden" });

    await pool.query("DELETE FROM assignments WHERE id = ?", [id]);
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to delete assignment" });
  }
});

export default router;
