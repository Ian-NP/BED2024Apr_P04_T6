import sql from "mssql"
import dbConfig from "../dbConfig";

class ChatBotHistory {
    constructor(chatHistoryId, role, text, timeStamp, conversationId) {
      this.chatHistoryId = chatHistoryId;
      this.role = role;
      this.text = text;
      this.timeStamp = timeStamp;
      this.conversationId = conversationId;
    }

    // Combined function to fetch and format chat history for GeminiChat
    static async fetchAndFormatChatHistoryForGemini(conversationId) {
      let connection;

      try {
          const connection = await sql.connect(dbConfig);
          const sqlQuery = `
              SELECT role, text
              FROM ChatBotHistory
              WHERE conversationId = @conversationId
              ORDER BY timeStamp ASC;
          `;

          const request = connection.request();
          request.input("conversationId", sql.Int, conversationId);
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
                  record.text.replace(/\n/g, '<br>'),
                  record.timeStamp,
                  record.conversationId
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

    // Add history to the database
    static async addChatHistory(role, text, conversationId) {
      let connection;

      try {
          const connection = await sql.connect(dbConfig);
          const sqlQuery = `
              INSERT INTO ChatBotHistory (role, text, timeStamp, conversationId)
              VALUES (@role, @text, GETDATE(), @conversationId);
          `;

          const request = connection.request();
          request.input("role", sql.NVarChar(5), role); // Assuming role is limited to 'user' or 'model'
          request.input("text", sql.NVarChar(sql.MAX), text); // Adjust as per your actual text size
          request.input("conversationId", sql.Int, conversationId);
          const result = await request.query(sqlQuery);

          console.log(`Inserted chat history for conversationId ${conversationId}`);

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
}

module.exports = ChatBotHistory;