import mysql from "mysql2/promise";

// WARNING: Credentials are hardcoded per user request.
// Update the values below to match your local MySQL setup.
const DB_CONFIG = {
  host: "localhost",
  port: 3306,
  user: "root",
  // Replace with your actual MySQL password
  password: "mysql123",
  database: "ooad_school_management",
  connectionLimit: 10,
};

export const pool = mysql.createPool({
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  user: DB_CONFIG.user,
  password: DB_CONFIG.password,
  database: DB_CONFIG.database,
  waitForConnections: true,
  connectionLimit: DB_CONFIG.connectionLimit,
  queueLimit: 0,
});

export async function healthCheck() {
  const [rows] = await pool.query("SELECT 1 as ok");
  return rows?.[0]?.ok === 1;
}
