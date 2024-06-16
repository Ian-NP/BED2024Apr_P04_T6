import sql from "mssql"
import dbConfig from "../dbConfig";

class ArticleComments{
    constructor(id, content, score, timeStamp, userId, articleId, parentCommentId, level=null){
        this.commentId = id;
        this.content = content;
        this.score = score;
        this.timeStamp = timeStamp;
        this.userId = userId;
        this.articleId = articleId;
        this.parentCommentId = parentCommentId;
        this.level = level;
    }

    static async getAllCommentsFromArticleId(articleId){
        let connection;
        
        try{
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `                
                WITH CommentTree AS (
                    SELECT
                        commentId,
                        content,
                        parentCommentId,
                        timeStamp,
                        score,
                        userId,
                        articleId,
                        0 AS level
                    FROM ArticleComments
                    WHERE parentCommentId IS NULL AND articleId = 1

                    UNION ALL

                    SELECT
                        ac.commentId,
                        ac.content,
                        ac.parentCommentId,
                        ac.timeStamp,
                        ac.score,
                        ac.userId,
                        ac.articleId,
                        ct.level + 1
                    FROM ArticleComments ac
                    INNER JOIN CommentTree ct ON ac.parentCommentId = ct.commentId
                )
                SELECT * FROM CommentTree
                ORDER BY level, timeStamp
                OPTION (MAXRECURSION 0);
            `;
            // MIGHT NEED TO CHANGE SQL QUERY

            const request = connection.request();
            request.input("articleId", sql.Int, articleId);
            const result = await request.query(sqlQuery);
            
            // Map the recordset to an array of ArticleComments objects
            const comments = result.recordset.map(record => 
                new ArticleComments(
                    record.commentId,
                    record.content,
                    record.score,
                    record.timeStamp,
                    record.userId,
                    record.articleId,
                    record.parentCommentId,
                    record.level
                )
            );
            return comments;
        } catch (error) {
            console.error('Error getting comments:', error);
            throw new Error("Error getting comments");
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

    static async getArticleCommentById(id){
        let connection;

        try {
            // Establish a connection to the database
            connection = await sql.connect(dbConfig);

            // Define the SQL query for retrieving a book by its ID
            const sqlQuery = `
                SELECT * 
                FROM ArticleComments 
                WHERE commentId = @id;
            `;

            // Create a request object and input the parameter
            const request = connection.request();
            request.input("id", sql.Int, id); // Ensure correct SQL data type for id

             // Execute the query
             const result = await request.query(sqlQuery);
    
             // Check if a book was found
             return result.recordset[0]
                 ? new ArticleComments(
                     result.recordset[0].commentId,
                     result.recordset[0].content,
                     result.recordset[0].score,
                     result.recordset[0].timeStamp,
                     result.recordset[0].userId,
                     result.recordset[0].articleId,
                     result.recordset[0].parentCommentId
                 )
                 : null;
        } 
        catch (error) {
            console.error('Error fetching comment by ID:', error);
            throw error; // Optionally, rethrow the error or handle it as needed
        } 
        finally {
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

    static async createArticleComment(newCommentData){
        let connection;

        try{
            // Establish a connection to the database
            connection = await sql.connect(dbConfig);

            // Define the SQL query for inserting a new book and getting the generated ID
            const sqlQuery = `
                INSERT INTO ArticleComments (content, score, timeStamp, userId, articleId, parentCommentId)
                VALUES (@content, @score, @timeStamp, @userId, @articleId, @parentCommentId);
                SELECT SCOPE_IDENTITY() AS newCommentId;
            `;
    
            // Create a request object and input the parameters
            const request = connection.request();
            request.input("content", sql.NVarChar(sql.MAX), newCommentData.content);
            request.input("score", sql.Int, newCommentData.score);
            request.input("timeStamp", sql.DateTime2, newCommentData.timeStamp);
            request.input("userId", sql.Int, newCommentData.userId);
            request.input("articleId", sql.Int, newCommentData.articleId);
            request.input("parentCommentId", sql.Int, newCommentData.parentCommentId); 
    
            // Execute the query
            const result = await request.query(sqlQuery);
    
            // Extract the newly generated ID from the result
            const newCommentId = result.recordset[0].newCommentId;
    
            // Fetch the newly created book by its ID
            const createdComment = await this.getArticleCommentById(newCommentId);
    
            return createdComment;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error; // Optionally, rethrow the error or handle it as needed
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

    static async updateArticleCommentContent(id, newContent){
        let connection;

        try{
            // Establish a connection to the database
            connection = await sql.connect(dbConfig);

            // Define the SQL query with parameterized placeholders
            const sqlQuery = `
                UPDATE ArticleComments 
                SET 
                    content = @newContent
                WHERE 
                    commentId = @id;
            `;

            // Create a request object and input the parameters
            const request = connection.request();
            request.input("id", sql.Int, id); // Ensure correct SQL data type for id
            request.input("newContent", newContent); // Use SQL data types

            // Execute the query
            await request.query(sqlQuery);

            // Return the updated book data
            return await this.getArticleCommentById(id);
        } catch (error) {
            console.error('Error updating comment:', error);
            throw error; // Optionally, rethrow the error or handle it as needed
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

    static async deleteArticleComment(id) {
        let connection;
    
        try {
            // Establish a connection to the database
            connection = await sql.connect(dbConfig);
    
            // Define the SQL query with a parameter placeholder
            const sqlQuery = `DELETE FROM ArticleComments WHERE commentId = @id`;
    
            // Create a request object and input the parameter
            const request = connection.request();
            request.input("id", sql.Int, id); // Ensure the correct SQL data type is used
    
            // Execute the query
            const result = await request.query(sqlQuery);
    
            // Check if the DELETE statement affected any rows
            const rowsAffectedByDelete = result.rowsAffected[1]; // Assuming DELETE statement is at index 1
    
            // Return true if rows were affected (indicating successful deletion), otherwise false
            return rowsAffectedByDelete > 0;
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error; // Rethrow the error to be handled elsewhere if needed
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

module.exports = ArticleComments;