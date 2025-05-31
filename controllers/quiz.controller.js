// const { pgPool } = require("../config/db");

// exports.getQuizQuestions = async (req, res) => {
//   try {
//     const { difficulty, category, limit = 10 } = req.query;
//     let query = "SELECT * FROM quiz_master";
//     const params = [];

//     if (difficulty || category) {
//       query += " WHERE";
//       if (difficulty) {
//         query += " difficulty_level = $1";
//         params.push(difficulty);
//       }
//       if (difficulty && category) query += " AND";
//       if (category) {
//         query += `${difficulty ? "" : ""} category = $${params.length + 1}`;
//         params.push(category);
//       }
//     }

//     query += ` ORDER BY RANDOM() LIMIT $${params.length + 1}`;
//     params.push(limit);

//     const result = await pgPool.query(query, params);
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.submitQuizResponse = async (req, res) => {
//   const { userId, responses } = req.body;

//   try {
//     const client = await pgPool.connect();
//     try {
//       await client.query("BEGIN");

      
//       const attemptResult = await client.query(
//         "SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt FROM quiz_response WHERE user_id = $1",
//         [userId]
//       );
//       const attemptNumber = attemptResult.rows[0].next_attempt;

//       let correctAnswers = 0;
//       let totalPoints = 0;

//       // Insert each response
//       for (const response of responses) {
//         const isCorrect = response.selectedAnswer === response.correctAnswer;
//         const points = isCorrect ? 10 : 0;

//         await client.query(
//           `INSERT INTO quiz_response 
//            (user_id, quiz_id, attempt_number, selected_answer, is_correct, points_earned)
//            VALUES ($1, $2, $3, $4, $5, $6)`,
//           [
//             userId,
//             response.quizId,
//             attemptNumber,
//             response.selectedAnswer,
//             isCorrect,
//             points,
//           ]
//         );

//         if (isCorrect) correctAnswers++;
//         totalPoints += points;
//       }

//       await client.query("COMMIT");

//       res.json({
//         success: true,
//         attemptNumber,
//         correctAnswers,
//         totalPoints,
//         totalQuestions: responses.length,
//       });
//     } catch (err) {
//       await client.query("ROLLBACK");
//       throw err;
//     } finally {
//       client.release();
//     }
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };









const { pgPool } = require("../config/db");

exports.getQuizQuestions = async (req, res) => {
  try {
    const { difficulty, category, limit = 10 } = req.query;
    let query = "SELECT * FROM quiz_master";
    const params = [];

    if (difficulty || category) {
      query += " WHERE";
      if (difficulty) {
        query += " difficulty_level = $1";
        params.push(difficulty);
      }
      if (difficulty && category) query += " AND";
      if (category) {
        query += `${difficulty ? "" : ""} category = $${params.length + 1}`;
        params.push(category);
      }
    }

    query += ` ORDER BY RANDOM() LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pgPool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// exports.submitQuizResponse = async (req, res) => {
//   try {
//     const userId = req.user.postgresId;
//     const { responses } = req.body;

//     if (!responses || !Array.isArray(responses)) {
//       return res.status(400).json({ message: "Invalid responses format" });
//     }

//     if (responses.length !== 10) {
//       console.error(
//         "SubmitQuiz: Expected 10 responses, received:",
//         responses.length,
//         "responses:",
//         responses
//       ); // Debug
//       return res
//         .status(400)
//         .json({
//           message: `Expected 10 responses, received ${responses.length}`,
//         });
//     }

//     const client = await pgPool.connect();
//     try {
//       await client.query("BEGIN");

//       // Get current attempt number
//       const attemptResult = await client.query(
//         "SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt FROM quiz_response WHERE user_id = $1",
//         [userId]
//       );
//       const attemptNumber = attemptResult.rows[0].next_attempt;

//       let correctAnswers = 0;
//       let totalPoints = 0;

//       // Validate quiz IDs
//       const quizIds = responses.map((r) => r.quizId);
//       const validQuizzes = await client.query(
//         "SELECT id FROM quiz_master WHERE id = ANY($1::int[])",
//         [quizIds]
//       );
//       const validQuizIds = validQuizzes.rows.map((r) => r.id);
//       if (validQuizIds.length !== responses.length) {
//         throw new Error("Invalid quiz IDs");
//       }

//       // Insert each response
//       for (const response of responses) {
//         const isCorrect = response.selectedAnswer === response.correctAnswer;
//         const points = isCorrect ? 10 : 0;

//         console.log("SubmitQuiz: Processing response:", {
//           quizId: response.quizId,
//           isCorrect,
//           points,
//         }); // Debug

//         await client.query(
//           `INSERT INTO quiz_response 
//            (user_id, quiz_id, attempt_number, selected_answer, is_correct, points_earned)
//            VALUES ($1, $2, $3, $4, $5, $6)`,
//           [
//             userId,
//             response.quizId,
//             attemptNumber,
//             response.selectedAnswer,
//             isCorrect,
//             points,
//           ]
//         );

//         if (isCorrect) correctAnswers++;
//         totalPoints += points;
//       }

//       await client.query("COMMIT");

//       res.json({
//         success: true,
//         attemptNumber,
//         correctAnswers,
//         totalPoints,
//         totalQuestions: responses.length,
//       });
//     } catch (err) {
//       await client.query("ROLLBACK");
//       console.error("SubmitQuiz: Transaction error:", err); // Debug
//       throw err;
//     } finally {
//       client.release();
//     }
//   } catch (err) {
//     console.error("SubmitQuiz: Server error:", err); // Debug
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };



exports.submitQuizResponse = async (req, res) => {
  try {
    const userId = req.user.postgresId;
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ message: "Invalid responses format" });
    }

    if (responses.length !== 10) {
      console.warn(
        "SubmitQuiz: Expected 10 responses, received:",
        responses.length,
        "responses:",
        responses
      );
    }

    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");

      const attemptResult = await client.query(
        "SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt FROM quiz_response WHERE user_id = $1",
        [userId]
      );
      const attemptNumber = attemptResult.rows[0].next_attempt;

      let correctAnswers = 0;
      let totalPoints = 0;

      const quizIds = responses.map((r) => r.quizId);
      const validQuizzes = await client.query(
        "SELECT id FROM quiz_master WHERE id = ANY($1::int[])",
        [quizIds]
      );
      const validQuizIds = validQuizzes.rows.map((r) => r.id);
      if (validQuizIds.length !== responses.length) {
        throw new Error("Invalid quiz IDs");
      }

      for (const response of responses) {
        const isCorrect = response.selectedAnswer === response.correctAnswer;
        const points = isCorrect ? 10 : 0;

        console.log("SubmitQuiz: Processing response:", {
          quizId: response.quizId,
          isCorrect,
          points,
        });

        await client.query(
          `INSERT INTO quiz_response 
           (user_id, quiz_id, attempt_number, selected_answer, is_correct, points_earned)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userId,
            response.quizId,
            attemptNumber,
            response.selectedAnswer,
            isCorrect,
            points,
          ]
        );

        if (isCorrect) correctAnswers++;
        totalPoints += points;
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        attemptNumber,
        correctAnswers,
        totalPoints,
        totalQuestions: responses.length,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("SubmitQuiz: Transaction error:", err); // Debug
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("SubmitQuiz: Server error:", err); // Debug
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



exports.getLeaderboard = async (req, res) => {
  try {
    const query = `
      SELECT u.username,u.id, mongo_id,SUM(qr.points_earned) as total_points
      FROM user_table u
      LEFT JOIN quiz_response qr ON u.id = qr.user_id
      GROUP BY u.id, u.username
      ORDER BY total_points DESC
      LIMIT 10
    `;
    const result = await pgPool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};