import sql from "mssql";
import dbConfig from "../dbConfig";

class RefreshTokenModel {
    constructor(id, userId, token, expiresAt) {
        this.id = id;
        this.userId = userId;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    static async getUserByRefreshToken(refreshToken) {
        let connection;
        try {
          connection = await sql.connect(dbConfig);
          const result = await connection.request()
            .input('refreshToken', sql.VarChar, refreshToken)
            .query(`
              SELECT u.userId, u.email, u.name, u.userType
              FROM refresh_tokens rt
              JOIN Users u ON rt.user_id = u.userId
              WHERE rt.token = @refreshToken AND rt.expires_at > GETDATE()
            `);
    
          return result.recordset[0]; // Returns undefined if no user found
        } catch (error) {
          console.error('Error retrieving user by refresh token:', error);
          throw error;
        } finally {
          if (connection) {
            try {
              await connection.close();
            } catch (closeError) {
              console.error('Error closing the connection:', closeError);
            }
          }
        }
      }

    static async deleteRefreshToken(token) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                DELETE FROM refresh_tokens
                WHERE token = @token
            `;
            const request = connection.request();
            request.input("token", sql.VarChar, token);
            await request.query(sqlQuery);

            return true; 
        } catch (error) {
            console.error('Error deleting refresh token:', error);
            throw new Error("Error deleting refresh token");
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error closing the connection:', closeError);
                }
            }
        }
    }

    static async addToken(userId, token) {
        let connection;
        try {
          connection = await sql.connect(dbConfig);
          const sqlQuery = `
            INSERT INTO refresh_tokens (user_id, token, expires_at)
            VALUES (@userId, @token, @expiresAt)
          `;
          const request = connection.request();
          request.input("userId", sql.Int, userId);
          request.input("token", sql.VarChar, token);
          request.input("expiresAt", sql.DateTime, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); 
          await request.query(sqlQuery);
        } catch (error) {
          console.error('Error adding refresh token:', error);
          throw new Error("Error adding refresh token");
        } finally {
          if (connection) {
            try {
              await connection.close();
            } catch (closeError) {
              console.error('Error closing the connection:', closeError);
            }
          }
        }
      }
}


module.exports = RefreshTokenModel;