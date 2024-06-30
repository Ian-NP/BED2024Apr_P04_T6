const sql = require("mssql");
const dbConfig = require("../dbConfig");
const { Buffer } = require('buffer');

class Article {
    constructor(articleId, photo, title, userId, content, publicationDate) {
        this.articleId = articleId;
        this.photo = photo;
        this.title = title;
        this.userId = userId;
        this.content = content;
        this.publicationDate = publicationDate;
    }

    static async getAllArticles() {
        let connection;
    
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT 
                    articleId, 
                    photo, 
                    title, 
                    userId, 
                    content, 
                    publicationDate
                FROM Articles 
            `;
            const request = connection.request();
            const result = await request.query(sqlQuery);
    
            const article = result.recordset.map(record => {
                const photoBase64 = record.photo ? record.photo.toString('base64') : null; //convert photo
                return new Article(
                    record.articleId,
                    photoBase64,
                    record.title,
                    record.userId,
                    record.content,
                    record.publicationDate
                );
            });
            
            return article;
        } catch (error) {
            console.error('Error getting articles:', error);
            throw new Error("Error getting articles");
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
    

    static async getArticleByTitle(title) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Articles WHERE title LIKE @title`;
        const request = connection.request();
        request.input("title", sql.NVarChar, `%${title}%`);
        const result = await request.query(sqlQuery);
        connection.close();
        return result.recordset[0] ? new Article(
            result.recordset[0].articleId,
            result.recordset[0].photo,
            result.recordset[0].title,
            result.recordset[0].userId,
            result.recordset[0].content,
            result.recordset[0].publicationDate
        ) : null;
    }

    static async createArticle(newArticle) {
        let connection;
    
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO Articles (photo, title, userId, content, publicationDate) 
                VALUES (@photo, @title, @userId, @content, @publicationDate);
                SELECT SCOPE_IDENTITY() AS articleId;
            `;
            
            const request = connection.request();
            request.input("photo", sql.VarBinary, newArticle.photo);
            request.input("title", sql.NVarChar, newArticle.title);
            request.input("userId", sql.Int, newArticle.userId);
            request.input("content", sql.NVarChar, newArticle.content);
            request.input("publicationDate", sql.DateTime2, newArticle.publicationDate);
    
            const result = await request.query(sqlQuery);
            const insertedArticleId = result.recordset[0].articleId;
    
            // Retrieve the newly inserted article by its ID
            const createdArticle = await this.getArticleById(insertedArticleId);
            return createdArticle;
        } catch (error) {
            console.error('Error creating article:', error);
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
    

    static async getArticleById(articleId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Articles WHERE articleId = @articleId`;
            const request = connection.request();
            request.input("articleId", sql.Int, articleId);
            const result = await request.query(sqlQuery);
    
            if (result.recordset.length > 0) {
                const record = result.recordset[0];
                const photoBase64 = record.photo ? record.photo.toString('base64') : null; // Convert photo to base64
                return new Article(
                    record.articleId,
                    photoBase64,
                    record.title,
                    record.userId,
                    record.content,
                    record.publicationDate
                );
            } else {
                throw new Error('Article not found');
            }
        } catch (error) {
            console.error('SQL Error:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (error) {
                    console.error('Error closing SQL connection:', error);
                }
            }
        }
    }    
    

    static async updateArticle(articleId, updatedArticle) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `UPDATE Articles SET 
                            photo = @photo, 
                            title = @title, 
                            userId = @userId, 
                            content = @content, 
                            publicationDate = @publicationDate 
                          WHERE articleId = @articleId`;
        const request = connection.request();
        const binaryPhoto = Buffer.from(updatedArticle.photo, 'base64');
        request.input("articleId", sql.Int, articleId);
        request.input("photo", sql.VarBinary, binaryPhoto);
        request.input("title", sql.NVarChar, updatedArticle.title);
        request.input("userId", sql.Int, updatedArticle.userId);
        request.input("content", sql.NVarChar, updatedArticle.content);
        request.input("publicationDate", sql.DateTime2, updatedArticle.publicationDate);
        await request.query(sqlQuery);
        connection.close();
        return this.getArticleById(articleId);
    }

    static async deleteArticle(articleId) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `DELETE FROM Articles WHERE articleId = @articleId`;
        const request = connection.request();
        request.input("articleId", sql.Int, articleId);
        const result = await request.query(sqlQuery);
        connection.close();
        return result.rowsAffected > 0;
    }

    static async getFavouriteArticles(userId) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT A.* FROM Articles A
                          JOIN UserFavouriteArticles F ON A.articleId = F.articleId
                          WHERE F.userId = @userId`;
        const request = connection.request();
        request.input("userId", sql.Int, userId);
        const result = await request.query(sqlQuery);
        connection.close();
        return result.recordset.map(row => new Article(
            row.articleId, row.photo, row.title, row.userId, row.content, row.publicationDate
        ));
    }

    static async addFavouriteArticle(userId, articleId) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `INSERT INTO UserFavouriteArticles (userId, articleId) VALUES (@userId, @articleId)`;
        const request = connection.request();
        request.input("userId", sql.Int, userId);
        request.input("articleId", sql.Int, articleId);
        await request.query(sqlQuery);
        connection.close();
        return true;
    }

    static async removeFavouriteArticle(userId, articleId) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `DELETE FROM UserFavouriteArticles WHERE userId = @userId AND articleId = @articleId`;
        const request = connection.request();
        request.input("userId", sql.Int, userId);
        request.input("articleId", sql.Int, articleId);
        await request.query(sqlQuery);
        connection.close();
        return true;
    }

    

}

module.exports = Article;
