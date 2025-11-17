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
  console.log("[DEBUG] Checking isStudent for userId:", userId);
  // First check students table
  const [[s]] = await pool.query(
    "SELECT user_id FROM students WHERE user_id = ?",
    [userId]
  );
  console.log("[DEBUG] Student query result:", s);
  if (s) return true;

  // Fallback: check user role in users table
  const [[u]] = await pool.query("SELECT role FROM users WHERE id = ?", [
    userId,
  ]);
  console.log("[DEBUG] User role from users table:", u?.role);
  return u?.role === "student";
}

router.get("/classes/:classId/quizzes", requireAuth, async (req, res) => {
  const { classId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM quizzes WHERE class_id = ? ORDER BY (due_at IS NULL), due_at DESC",
      [classId]
    );
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

router.post("/classes/:classId/quizzes", requireAuth, async (req, res) => {
  const { userId } = req.user;
  if (!(await isTeacher(userId)))
    return res.status(403).json({ error: "Forbidden" });
  const { classId } = req.params;
  const { title, description, due_at, questions } = req.body || {};
  if (!title) return res.status(400).json({ error: "Title required" });
  if (!Array.isArray(questions) || questions.length === 0)
    return res.status(400).json({ error: "Questions required" });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [qr] = await conn.query(
      "INSERT INTO quizzes (class_id, title, description, due_at, created_by) VALUES (?, ?, ?, ?, ?)",
      [classId, title, description || null, due_at || null, userId]
    );
    const quizId = qr.insertId;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const [qRes] = await conn.query(
        "INSERT INTO quiz_questions (quiz_id, question_text, position) VALUES (?, ?, ?)",
        [quizId, q.text, i + 1]
      );
      const questionId = qRes.insertId;
      for (let j = 0; j < (q.options || []).length; j++) {
        const opt = q.options[j];
        await conn.query(
          "INSERT INTO quiz_options (question_id, option_text, position, is_correct) VALUES (?, ?, ?, ?)",
          [questionId, opt.text, j + 1, !!opt.is_correct]
        );
      }
    }
    await conn.commit();
    const [[quiz]] = await pool.query("SELECT * FROM quizzes WHERE id = ?", [
      quizId,
    ]);
    return res.status(201).json(quiz);
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return res.status(500).json({ error: "Failed to create quiz" });
  } finally {
    conn.release();
  }
});

router.get("/quizzes/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [[quiz]] = await pool.query("SELECT * FROM quizzes WHERE id = ?", [
      id,
    ]);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    const [questions] = await pool.query(
      "SELECT id, quiz_id, question_text as text, position FROM quiz_questions WHERE quiz_id = ? ORDER BY position",
      [id]
    );
    const qids = questions.map((q) => q.id);
    let options = [];
    if (qids.length) {
      const [optRows] = await pool.query(
        "SELECT id, question_id, option_text as text, position, is_correct FROM quiz_options WHERE question_id IN (?) ORDER BY position",
        [qids]
      );
      options = optRows;
    }
    const full = questions.map((q) => ({
      ...q,
      options: options.filter((o) => o.question_id === q.id),
    }));
    return res.json({ ...quiz, questions: full });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

// Student: fetch own quiz submission for status display
router.get("/quizzes/:id/my-submission", requireAuth, async (req, res) => {
  const { userId } = req.user;
  try {
    const [[row]] = await pool.query(
      "SELECT * FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?",
      [req.params.id, userId]
    );
    if (!row) return res.json(null);

    // Fetch answers for this submission
    const [answers] = await pool.query(
      "SELECT question_id, selected_option_id, is_correct FROM quiz_answers WHERE submission_id = ?",
      [row.id]
    );

    return res.json({ ...row, answers });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch quiz submission" });
  }
});

router.post("/quizzes/:id/submissions", requireAuth, async (req, res) => {
  const { userId } = req.user;
  console.log("[DEBUG] Quiz submission - userId:", userId);
  const studentCheck = await isStudent(userId);
  console.log("[DEBUG] isStudent result:", studentCheck);
  if (!studentCheck) return res.status(403).json({ error: "Forbidden" });
  const { id } = req.params;
  const { answers } = req.body || {};
  if (!Array.isArray(answers) || answers.length === 0)
    return res.status(400).json({ error: "Answers required" });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Create submission
    const [subRes] = await conn.query(
      "INSERT INTO quiz_submissions (quiz_id, student_id, submitted_at, score) VALUES (?, ?, NOW(), 0)",
      [id, userId]
    );
    const submissionId = subRes.insertId;

    // Fetch correct options for scoring
    const qids = answers.map((a) => a.question_id);
    let correctMap = new Map();
    if (qids.length) {
      const [rows] = await conn.query(
        "SELECT qo.question_id, qo.id as option_id, qo.is_correct FROM quiz_options qo WHERE qo.question_id IN (?)",
        [qids]
      );
      console.log("[DEBUG] Quiz options from DB:", rows);
      for (const r of rows) {
        if (!correctMap.has(r.question_id))
          correctMap.set(r.question_id, {
            correctOptionId: null,
          });
        if (r.is_correct) {
          correctMap.get(r.question_id).correctOptionId = r.option_id;
        }
      }
    }

    console.log(
      "[DEBUG] Correct options map:",
      Array.from(correctMap.entries())
    );

    let score = 0;
    for (const a of answers) {
      const correct = correctMap.get(a.question_id) || {
        correctOptionId: null,
      };
      const is_correct = a.selected_option_id === correct.correctOptionId;
      console.log(
        `[DEBUG] Question ${a.question_id}: selected=${
          a.selected_option_id
        }, correct=${
          correct.correctOptionId
        }, match=${is_correct}, types: ${typeof a.selected_option_id} vs ${typeof correct.correctOptionId}`
      );
      if (is_correct) score += 1;
      await conn.query(
        "INSERT INTO quiz_answers (submission_id, question_id, selected_option_id, is_correct) VALUES (?, ?, ?, ?)",
        [submissionId, a.question_id, a.selected_option_id || null, is_correct]
      );
    }

    await conn.query("UPDATE quiz_submissions SET score = ? WHERE id = ?", [
      score,
      submissionId,
    ]);
    await conn.commit();

    const [[result]] = await pool.query(
      "SELECT * FROM quiz_submissions WHERE id = ?",
      [submissionId]
    );

    // Fetch answers for the response
    const [submittedAnswers] = await pool.query(
      "SELECT question_id, selected_option_id, is_correct FROM quiz_answers WHERE submission_id = ?",
      [submissionId]
    );

    return res.status(201).json({ ...result, answers: submittedAnswers });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return res.status(500).json({ error: "Failed to submit quiz" });
  } finally {
    conn.release();
  }
});

router.get("/quizzes/:id/submissions", requireAuth, async (req, res) => {
  const { userId } = req.user;
  if (!(await isTeacher(userId)))
    return res.status(403).json({ error: "Forbidden" });
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT qs.*, u.full_name, u.email, u.username FROM quiz_submissions qs JOIN users u ON u.id = qs.student_id WHERE qs.quiz_id = ?",
      [id]
    );
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch quiz submissions" });
  }
});

// Delete quiz
router.delete("/quizzes/:id", requireAuth, async (req, res) => {
  const { userId } = req.user;
  if (!(await isTeacher(userId)))
    return res.status(403).json({ error: "Forbidden" });
  const { id } = req.params;
  try {
    const [[quiz]] = await pool.query("SELECT * FROM quizzes WHERE id = ?", [
      id,
    ]);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // Verify teacher owns this quiz's class
    const [[cls]] = await pool.query(
      "SELECT teacher_id FROM classes WHERE id = ?",
      [quiz.class_id]
    );
    if (!cls || cls.teacher_id !== userId)
      return res.status(403).json({ error: "Forbidden" });

    await pool.query("DELETE FROM quizzes WHERE id = ?", [id]);
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to delete quiz" });
  }
});

export default router;
