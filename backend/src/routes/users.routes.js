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

export default router;
