import { Router } from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { hashPassword } from "../utils/password.js";

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

export default router;

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
    const password_hash = await hashPassword(password);
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
    const password_hash = await hashPassword(password);
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
