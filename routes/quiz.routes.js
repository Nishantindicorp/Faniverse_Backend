const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get(
  "/questions",
  authMiddleware.authenticate,
  quizController.getQuizQuestions
);
router.post(
  "/submit",
  authMiddleware.authenticate,
  quizController.submitQuizResponse
);

router.get(
  "/leaderboard",
  authMiddleware.authenticate,
  quizController.getLeaderboard
);

module.exports = router;
