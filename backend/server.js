import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { pool, healthCheck } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import classesRoutes from "./src/routes/classes.routes.js";
import assignmentsRoutes from "./src/routes/assignments.routes.js";
import quizzesRoutes from "./src/routes/quizzes.routes.js";
import filesRoutes from "./src/routes/files.routes.js";
import usersRoutes from "./src/routes/users.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Static file serving for uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/files", express.static(path.resolve(__dirname, "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api", assignmentsRoutes);
app.use("/api", quizzesRoutes);
app.use("/api/files", filesRoutes);

app.get("/health", async (_req, res) => {
  try {
    const ok = await healthCheck();
    return res.json({ ok });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  try {
    await pool.query("SELECT 1");
    console.log("DB connected");
  } catch (e) {
    console.error("DB connection failed:", e.message);
  }
  console.log(`Server running on port ${PORT}`);
});
