import { Router } from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

async function getRole(userId) {
  const [[s]] = await pool.query(
    "SELECT user_id FROM students WHERE user_id = ?",
    [userId]
  );
  if (s) return "student";
  const [[t]] = await pool.query(
    "SELECT user_id FROM teachers WHERE user_id = ?",
    [userId]
  );
  if (t) return "teacher";
  const [[a]] = await pool.query(
    "SELECT user_id FROM admins WHERE user_id = ?",
    [userId]
  );
  if (a) return "admin";
  return null;
}

router.get("/", requireAuth, async (req, res) => {
  const { userId } = req.user;
  try {
    const role = await getRole(userId);
    if (role === "teacher") {
      const [rows] = await pool.query(
        "SELECT c.* FROM classes c WHERE c.teacher_id = ?",
        [userId]
      );
      return res.json(rows);
    }
    if (role === "student") {
      const [rows] = await pool.query(
        "SELECT c.* FROM classes c JOIN enrollments e ON e.class_id = c.id WHERE e.student_id = ?",
        [userId]
      );
      return res.json(rows);
    }
    // admin: return all
    const [rows] = await pool.query("SELECT * FROM classes");
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch classes" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [[cls]] = await pool.query("SELECT * FROM classes WHERE id = ?", [
      id,
    ]);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    return res.json(cls);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch class" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name required" });
  try {
    // Only teacher or admin can create
    const role = await getRole(userId);
    if (!["teacher", "admin"].includes(role))
      return res.status(403).json({ error: "Forbidden" });
    const teacherId = role === "teacher" ? userId : req.body.teacher_id;
    if (!teacherId)
      return res.status(400).json({ error: "teacher_id required" });
    const [result] = await pool.query(
      "INSERT INTO classes (name, description, teacher_id) VALUES (?, ?, ?)",
      [name, description || null, teacherId]
    );
    const [[cls]] = await pool.query("SELECT * FROM classes WHERE id = ?", [
      result.insertId,
    ]);
    return res.status(201).json(cls);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create class" });
  }
});

router.post("/:classId/enroll/:studentId", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { classId, studentId } = req.params;
  try {
    const role = await getRole(userId);
    if (!["teacher", "admin"].includes(role))
      return res.status(403).json({ error: "Forbidden" });
    await pool.query(
      "INSERT IGNORE INTO enrollments (class_id, student_id) VALUES (?, ?)",
      [classId, studentId]
    );
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to enroll student" });
  }
});

// Student self-join by classId (treat classId as join code)
router.post("/:classId/join", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const role = await getRole(userId);
  if (role !== "student") return res.status(403).json({ error: "Forbidden" });
  const { classId } = req.params;
  try {
    await pool.query(
      "INSERT IGNORE INTO enrollments (class_id, student_id) VALUES (?, ?)",
      [classId, userId]
    );
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to join class" });
  }
});

export default router;
