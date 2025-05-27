const mongoose = require("mongoose");
const { Pool } = require("pg");

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err; // Re-throw to handle in server.js
  }
};

// PostgreSQL Connection Pool
const pgPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'userdb',
  password: 'nishant',
  port: 5432,
});

const connectPostgreSQL = async () => {
  try {
    // Test the connection
    await pgPool.query("SELECT NOW()");
    console.log("PostgreSQL Connected...");
  } catch (err) {
    console.error("PostgreSQL connection error:", err);
    throw err; // Re-throw to handle in server.js
  }
};

module.exports = {
  connectMongoDB,
  connectPostgreSQL,
  pgPool,
};
