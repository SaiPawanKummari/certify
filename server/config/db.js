const { Pool } = require("pg");

const pool = new Pool({
  user: String(process.env.DB_USER || "postgres"),
  host: String(process.env.DB_HOST || "localhost"),
  database: String(process.env.DB_NAME || "certify"),
  password: String(process.env.DB_PASSWORD || ""),
  port: Number(process.env.DB_PORT || 5432),
});

const connectDB = async () => {
  try {
    const client = await pool.connect();

    console.log("PostgreSQL connected successfully");

    client.release();
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
  }
};

module.exports = {
  pool,
  connectDB,
};