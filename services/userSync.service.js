const User = require("../models/User");
const { pgPool } = require("../config/db");

class UserSyncService {
  static async syncUserToPostgres(mongoUser) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");

      const userCheck = await client.query(
        "SELECT id FROM user_table WHERE mongo_id = $1",
        [mongoUser._id.toString()]
      );

      let postgresId;
      if (userCheck.rows.length === 0) {
        const result = await client.query(
          `INSERT INTO user_table (mongo_id, username) 
           VALUES ($1, $2) RETURNING id`,
          [mongoUser._id.toString(), mongoUser.username]
        );
        postgresId = result.rows[0].id;

        await User.findByIdAndUpdate(mongoUser._id, { postgresId });
      } else {
        postgresId = userCheck.rows[0].id;

        await client.query(
          "UPDATE user_table SET username = $1, updated_at = NOW() WHERE id = $2",
          [mongoUser.username, postgresId]
        );
      }

      await client.query("COMMIT");
      return postgresId;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async handleUserUpdate(mongoUserId) {
    const user = await User.findById(mongoUserId);
    if (!user) throw new Error("User not found");
    return this.syncUserToPostgres(user);
  }
}

module.exports = UserSyncService;
