import { Router } from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.put("/me", requireAuth, async (req, res) => {
  const { userId } = req.user;
  const { full_name, gender, phone } = req.body || {};
  try {
    await pool.query(
      "UPDATE users SET full_name = ?, gender = ?, phone = ? WHERE id = ?",
      [full_name || null, gender || null, phone || null, userId]
    );
    const [[user]] = await pool.query(
      "SELECT id, email, username, full_name, gender, phone, role FROM users WHERE id = ?",
      [userId]
    );
    return res.json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// Admin-only helper to assert role
async function assertAdmin(req, res) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  // If role missing in token (older token), derive from DB
  if (!req.user.role) {
    try {
      const [[a]] = await pool.query(
        "SELECT user_id FROM admins WHERE user_id = ?",
        [req.user.userId]
      );
      if (a) req.user.role = "admin"; // mutate for subsequent handlers
    } catch (e) {
      console.error("assertAdmin derive role error", e);
    }
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }
  return true;
}

// List students
router.get("/students", requireAuth, async (req, res) => {
  if (!(await assertAdmin(req, res))) return;
  console.log(
    "[students] admin list by userId",
    req.user.userId,
    "role",
    req.user.role
  );
  try {
    const [rows] = await pool.query(
      "SELECT u.id, u.username, u.email, u.full_name, u.gender, u.phone, u.created_at FROM users u JOIN students s ON s.user_id = u.id ORDER BY u.id DESC"
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list students" });
  }
});

// Create student
router.post("/students", requireAuth, async (req, res) => {
  if (!(await assertAdmin(req, res))) return;
  const {
    email,
    username,
    password,
    full_name,
    gender = null,
    phone = null,
  } = req.body || {};
  if (!email || !password || !username || !full_name) {
    return res
      .status(400)
      .json({ error: "email, username, password, full_name required" });
  }
  try {
    const [[emailExists]] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (emailExists)
      return res.status(409).json({ error: "Email already used" });
    const [[userExists]] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (userExists)
      return res.status(409).json({ error: "Username already used" });
    const password_hash = password;
    const role = "student";
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password_hash, full_name, gender, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [username, email, password_hash, full_name, gender, phone, role]
    );
    const userId = result.insertId;
    await pool.query("INSERT INTO students (user_id) VALUES (?)", [userId]);
    res
      .status(201)
      .json({ id: userId, email, username, full_name, gender, phone, role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create student" });
  }
});

// List teachers
router.get("/teachers", requireAuth, async (req, res) => {
  if (!(await assertAdmin(req, res))) return;
  console.log(
    "[teachers] admin list by userId",
    req.user.userId,
    "role",
    req.user.role
  );
  try {
    const [rows] = await pool.query(
      "SELECT u.id, u.username, u.email, u.full_name, u.gender, u.phone, u.created_at FROM users u JOIN teachers t ON t.user_id = u.id ORDER BY u.id DESC"
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list teachers" });
  }
});

// Create teacher
router.post("/teachers", requireAuth, async (req, res) => {
  if (!(await assertAdmin(req, res))) return;
  const {
    email,
    username,
    password,
    full_name,
    gender = null,
    phone = null,
  } = req.body || {};
  if (!email || !password || !username || !full_name) {
    return res
      .status(400)
      .json({ error: "email, username, password, full_name required" });
  }
  try {
    const [[emailExists]] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (emailExists)
      return res.status(409).json({ error: "Email already used" });
    const [[userExists]] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (userExists)
      return res.status(409).json({ error: "Username already used" });
    const password_hash = password;
    const role = "teacher";
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password_hash, full_name, gender, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [username, email, password_hash, full_name, gender, phone, role]
    );
    const userId = result.insertId;
    await pool.query("INSERT INTO teachers (user_id) VALUES (?)", [userId]);
    res
      .status(201)
      .json({ id: userId, email, username, full_name, gender, phone, role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create teacher" });
  }
});

// Update student
router.put("/students/:id", requireAuth, async (req, res) => {
  if (!(await assertAdmin(req, res))) return;
  const { id } = req.params;
  const {
    email,
    username,
    password,
    full_name,
    gender = null,
    phone = null,
  } = req.body || {};

  try {
    // Check if student exists
    const [[student]] = await pool.query(
      "SELECT user_id FROM students WHERE user_id = ?",
      [id]
    );
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check email uniqueness if changed
    if (email) {
      const [[emailExists]] = await pool.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, id]
      );
      if (emailExists) {
        return res.status(409).json({ error: "Email already used" });
      }
    }

    // Check username uniqueness if changed
    if (username) {
      const [[userExists]] = await pool.query(
        "SELECT id FROM users WHERE username = ? AND id != ?",
        [username, id]
      );
      if (userExists) {
        return res.status(409).json({ error: "Username already used" });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (username) {
      updates.push("username = ?");
      values.push(username);
    }
    if (password) {
      updates.push("password_hash = ?");
      values.push(password);
    }
    if (full_name) {
      updates.push("full_name = ?");
      values.push(full_name);
    }
    if (gender !== undefined) {
      updates.push("gender = ?");
      values.push(gender);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const [[updatedUser]] = await pool.query(
      "SELECT id, username, email, full_name, gender, phone, role FROM users WHERE id = ?",
      [id]
    );
    res.json(updatedUser);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update student" });
  }
});

// Update teacher
router.put("/teachers/:id", requireAuth, async (req, res) => {
  if (!(await assertAdmin(req, res))) return;
  const { id } = req.params;
  const {
    email,
    username,
    password,
    full_name,
    gender = null,
    phone = null,
  } = req.body || {};

  try {
    // Check if teacher exists
    const [[teacher]] = await pool.query(
      "SELECT user_id FROM teachers WHERE user_id = ?",
      [id]
    );
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Check email uniqueness if changed
    if (email) {
      const [[emailExists]] = await pool.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, id]
      );
      if (emailExists) {
        return res.status(409).json({ error: "Email already used" });
      }
    }

    // Check username uniqueness if changed
    if (username) {
      const [[userExists]] = await pool.query(
        "SELECT id FROM users WHERE username = ? AND id != ?",
        [username, id]
      );
      if (userExists) {
        return res.status(409).json({ error: "Username already used" });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (username) {
      updates.push("username = ?");
      values.push(username);
    }
    if (password) {
      updates.push("password_hash = ?");
      values.push(password);
    }
    if (full_name) {
      updates.push("full_name = ?");
      values.push(full_name);
    }
    if (gender !== undefined) {
      updates.push("gender = ?");
      values.push(gender);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const [[updatedUser]] = await pool.query(
      "SELECT id, username, email, full_name, gender, phone, role FROM users WHERE id = ?",
      [id]
    );
    res.json(updatedUser);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update teacher" });
  }
});

// Delete student
router.delete("/students/:id", requireAuth, async (req, res) => {
  if (!(await assertAdmin(req, res))) return;
  const { id } = req.params;

  try {
    // Check if student exists
    const [[student]] = await pool.query(
      "SELECT user_id FROM students WHERE user_id = ?",
      [id]
    );
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Delete user (cascade will delete student record)
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

// Delete teacher
router.delete("/teachers/:id", requireAuth, async (req, res) => {
  if (!(await assertAdmin(req, res))) return;
  const { id } = req.params;

  try {
    // Check if teacher exists
    const [[teacher]] = await pool.query(
      "SELECT user_id FROM teachers WHERE user_id = ?",
      [id]
    );
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Delete user (cascade will delete teacher record)
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete teacher" });
  }
});

export default router;
