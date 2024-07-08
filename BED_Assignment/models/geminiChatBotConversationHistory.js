import sql from "mssql"
import dbConfig from "../dbConfig";

class ChatBotHistory {
    constructor(chatHistoryId, role, text, timeStamp, userId) {
      this.chatHistoryId = chatHistoryId;
      this.role = role;
      this.text = text;
      this.timeStamp = timeStamp;
      this.userId = userId;
    }

    // Combined function to fetch and format chat history for GeminiChat
    static async fetchAndFormatChatHistoryForGemini(userId) {
      let connection;

      try {
          const connection = await sql.connect(dbConfig);
          const sqlQuery = `
              SELECT role, text
              FROM ChatBotHistory
              WHERE userId = @userId 
              ORDER BY timeStamp ASC;
          `;

          const request = connection.request();
          request.input("userId", sql.Int, userId);
          const result = await request.query(sqlQuery);

          // Format the result into the desired structure for GeminiChat
          const formattedHistory = result.recordset.map(row => ({
              role: row.role,
              parts: [{ text: row.text }]
          }));

          // Optionally, you can also fetch the full chat history as objects if needed
          const chatHistory = result.recordset.map(record =>
              new ChatBotHistory(
                  record.chatHistoryId,
                  record.role,
                  record.text,
                  record.timeStamp,
                  record.userId
              )
          );

          return { formattedHistory, chatHistory };

      } catch (error) {
          console.error('Error fetching and formatting chat history:', error);
          throw new Error("Error fetching and formatting chat history");
      } finally {
          // Ensure the connection is closed even if an error occurs
          if (connection) {
              try {
                  await connection.close();
              } catch (closeError) {
                  console.error('Error closing the connection:', closeError);
              }
          }
      }
    }

    // Clear the history from the database
    static async clearChatHistoryFromUserId(userId) {
      let connection;

      try {
          const connection = await sql.connect(dbConfig);
          const sqlQuery = `
              DELETE FROM ChatBotHistory
              WHERE userId = @userId;
          `;

          const request = connection.request();
          request.input("userId", sql.Int, userId);
          const result = await request.query(sqlQuery);

          // Check if rows were deleted
          if (result.rowsAffected[0] > 0) {
              console.log(`Deleted ${result.rowsAffected[0]} rows for userId ${userId}`);
              return true;  // Return true to indicate successful deletion
          } else {
              console.log(`No rows found for userId ${userId}`);
              return false; // Return false if no rows were deleted (optional)
          }
      } catch (error) {
          console.error('Error clearing chat History:', error);
          throw new Error("Error clearing chat history");
      } finally {
          // Ensure the connection is closed even if an error occurs
          if (connection) {
              try {
                  await connection.close();
              } catch (closeError) {
                  console.error('Error closing the connection:', closeError);
              }
          }
      }
    }

    // Add history to the database
    static async addChatHistory(role, text, userId) {
      let connection;

      try {
          const connection = await sql.connect(dbConfig);
          const sqlQuery = `
              INSERT INTO ChatBotHistory (role, text, timeStamp, userId)
              VALUES (@role, @text, GETDATE(), @userId);
          `;

          const request = connection.request();
          request.input("role", sql.NVarChar(5), role); // Assuming role is limited to 'user' or 'model'
          request.input("text", sql.NVarChar(sql.MAX), text); // Adjust as per your actual text size
          request.input("userId", sql.Int, userId);
          const result = await request.query(sqlQuery);

          console.log(`Inserted chat history for userId ${userId}`);

          // Optionally, return something if needed
          return true; // Example: Return true to indicate successful insertion
      } catch (error) {
          console.error('Error adding chat history:', error);
          throw new Error("Error adding chat history");
      } finally {
          // Ensure the connection is closed even if an error occurs
          if (connection) {
              try {
                  await connection.close();
              } catch (closeError) {
                  console.error('Error closing the connection:', closeError);
              }
          }
      }
    }

    // Potential for editChat
}

module.exports = ChatBotHistory;