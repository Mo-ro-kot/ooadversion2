import { Router } from "express";
import { pool } from "../config/db.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

async function getUserRole(userId) {
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

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  try {
    const [[user]] = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = ?",
      [email]
    );
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const role = await getUserRole(user.id);
    const token = signToken({ userId: user.id, role });
    return res.json({
      token,
      role,
      user: { id: user.id, email: user.email },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const { userId } = req.user;
  try {
    const [[user]] = await pool.query(
      "SELECT id, email FROM users WHERE id = ?",
      [userId]
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    const role = await getUserRole(user.id);
    return res.json({ role, user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Admin registration (creates a user and admin role)
router.post("/register-admin", async (req, res) => {
  try {
    const {
      email,
      password,
      username: rawUsername,
      full_name: rawFullName,
      gender = null,
      phone = null,
    } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    // Check if email exists
    const [[exists]] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (exists)
      return res.status(409).json({ error: "Email already registered" });
    // If username provided, ensure it's unique too
    if (rawUsername) {
      const [[uname]] = await pool.query(
        "SELECT id FROM users WHERE username = ?",
        [rawUsername.trim()]
      );
      if (uname)
        return res.status(409).json({ error: "Username already taken" });
    }

    const password_hash = await hashPassword(password);
    // Derive sensible defaults if not provided
    const username =
      rawUsername?.trim() ||
      (email.includes("@") ? email.split("@")[0] : email);
    const full_name = rawFullName?.trim() || "Admin";
    const role = "admin";
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password_hash, full_name, gender, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [username, email, password_hash, full_name, gender, phone, role]
    );
    const userId = result.insertId;
    await pool.query("INSERT INTO admins (user_id) VALUES (?)", [userId]);

    const token = signToken({ userId, role: "admin" });
    return res.status(201).json({
      token,
      role: "admin",
      user: { id: userId, email, username, full_name, gender, phone },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Registration failed" });
  }
});

export default router;
