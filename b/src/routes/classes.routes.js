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
  const { name } = req.body || {};
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
      "INSERT INTO classes (name, teacher_id) VALUES (?, ?)",
      [name, teacherId]
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

// Get enrolled students for a class
router.get("/:classId/students", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { classId } = req.params;
  try {
    const role = await getRole(userId);
    if (!role) return res.status(403).json({ error: "Forbidden" });

    const [students] = await pool.query(
      "SELECT u.id, u.username, u.email, u.full_name, u.gender, u.phone, e.enrolled_at FROM users u JOIN enrollments e ON e.student_id = u.id WHERE e.class_id = ? ORDER BY u.full_name",
      [classId]
    );
    return res.json(students);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch enrolled students" });
  }
});

// Update class
router.put("/:id", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const { name, status } = req.body || {};
  try {
    const role = await getRole(userId);
    if (!["teacher", "admin"].includes(role))
      return res.status(403).json({ error: "Forbidden" });

    // Check if class exists and user has permission
    const [[cls]] = await pool.query("SELECT * FROM classes WHERE id = ?", [
      id,
    ]);
    if (!cls) return res.status(404).json({ error: "Class not found" });

    if (role === "teacher" && cls.teacher_id !== userId)
      return res.status(403).json({ error: "Forbidden" });

    await pool.query(
      "UPDATE classes SET name = COALESCE(?, name), status = COALESCE(?, status) WHERE id = ?",
      [name || null, status || null, id]
    );

    const [[updated]] = await pool.query("SELECT * FROM classes WHERE id = ?", [
      id,
    ]);
    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update class" });
  }
});

// Delete class
router.delete("/:id", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  try {
    const role = await getRole(userId);
    if (!["teacher", "admin"].includes(role))
      return res.status(403).json({ error: "Forbidden" });

    const [[cls]] = await pool.query("SELECT * FROM classes WHERE id = ?", [
      id,
    ]);
    if (!cls) return res.status(404).json({ error: "Class not found" });

    if (role === "teacher" && cls.teacher_id !== userId)
      return res.status(403).json({ error: "Forbidden" });

    // Delete class (cascading deletes should handle enrollments, assignments, quizzes)
    await pool.query("DELETE FROM classes WHERE id = ?", [id]);
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to delete class" });
  }
});

// Remove student from class
router.delete(
  "/:classId/students/:studentId",
  requireAuth,
  async (req, res) => {
    const { userId } = req.user;
    const { classId, studentId } = req.params;
    try {
      const role = await getRole(userId);
      if (!["teacher", "admin"].includes(role))
        return res.status(403).json({ error: "Forbidden" });

      await pool.query(
        "DELETE FROM enrollments WHERE class_id = ? AND student_id = ?",
        [classId, studentId]
      );
      return res.status(204).send();
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .json({ error: "Failed to remove student from class" });
    }
  }
);

export default router;
