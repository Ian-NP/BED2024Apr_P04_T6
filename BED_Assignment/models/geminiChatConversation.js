import sql from "mssql"
import dbConfig from "../dbConfig";

class ChatConversation{
    constructor(conversationId, conversationTitle, timeStamp, userId) {
        this.conversationId = conversationId;
        this.conversationTitle = conversationTitle;
        this.timeStamp = timeStamp
        this.userId = userId;
    }

    static async fetchChatConversationsByUserId(userId){
        let connection;

        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT *
                FROM ChatConversations
                WHERE userId = @userId
                ORDER BY timeStamp DESC;
            `;

            const request = connection.request();
            request.input("userId", sql.Int, userId);
            const result = await request.query(sqlQuery);

            const chatConversations = result.recordset.map(record =>
                new ChatConversation(
                    record.conversationId,
                    record.conversationTitle,
                    record.timeStamp,
                    record.userId
                )
            );

            return chatConversations;
        } catch (error) {
            console.error('Error fetching and formatting chat conversations by userId:', error);
            throw new Error("Error fetching and formatting chat conversations by userId");
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

    static async deleteChatConversation(conversationId){
        let connection;
    
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                DELETE FROM ChatConversations WHERE conversationId = @conversationId
            `;
    
            const request = connection.request();
            request.input("conversationId", sql.Int, conversationId);
            const result = await request.query(sqlQuery);
    
            // Check the number of rows affected
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error deleting chat conversation by conversationId:', error);
            throw new Error("Error deleting chat conversation by conversationId");
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

    static async addNewConversation(conversationTitle, userId){
        let connection;
    
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO ChatConversations (conversationTitle, timeStamp, userId)
                VALUES (@conversationTitle, GETDATE(), @userId);
            `;
    
            const request = connection.request();
            request.input("conversationTitle", sql.NVarChar(sql.MAX), conversationTitle)
            request.input("userId", sql.Int, userId);
            const result = await request.query(sqlQuery);
    
            // Check the number of rows affected
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error creating chat conversation by conversationId:', error);
            throw new Error("Error creating chat conversation by conversationId");
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

    static async editConversationTitle(conversationTitle, conversationId){
        let connection;
    
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                UPDATE ChatConversations
                SET conversationTitle = @conversationTitle
                WHERE conversationId = @conversationId
            `;
    
            const request = connection.request();
            request.input("conversationTitle", sql.NVarChar(sql.MAX), conversationTitle);
            request.input("conversationId", sql.Int, conversationId);
            const result = await request.query(sqlQuery);
    
            // Check the number of rows affected
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error updating conversation title by conversationId:', error);
            throw new Error("Error updating conversation title by conversationId");
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

module.exports = ChatConversation;