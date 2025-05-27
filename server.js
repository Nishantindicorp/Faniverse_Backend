require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectMongoDB, connectPostgreSQL } = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const quizRoutes = require("./routes/quiz.routes");
const User = require("./models/User");

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);


app.get("/", (req, res) => {
  res.send("API Running");
});

// app.get("/add-user", (req, res) => {
//   const user = new User({
//     username: "testuser",
//     password: "password123",
//     postgresId: 3,
//   });

//   user
//     .save()
//     .then(() => res.send("User added"))
//     .catch((err) => res.status(500).send("Error adding user: " + err));
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;

// Initialize databases and start server
const startServer = async () => {
  try {
    await connectMongoDB();
    await connectPostgreSQL();

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
