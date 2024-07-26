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
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Articles WHERE title LIKE @title`;
            const request = connection.request();
            request.input("title", sql.NVarChar, `%${title}%`);
            const result = await request.query(sqlQuery);
            
            const articles = result.recordset.map(record => {
                const photoBase64 = record.photo ? record.photo.toString('base64') : null; // Convert photo to base64
                return new Article(
                    record.articleId,
                    photoBase64,
                    record.title,
                    record.userId,
                    record.content,
                    record.publicationDate
                );
            });
    
            return articles;
        } catch (error) {
            console.error('Error getting articles by title:', error);
            throw new Error('Error getting articles by title');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
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
            throw new Error('Error creating article');
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
            throw new Error('Error fetching article by ID');
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
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `UPDATE Articles SET 
                                photo = @photo, 
                                title = @title, 
                                content = @content, 
                                publicationDate = @publicationDate 
                              WHERE articleId = @articleId`;

            const request = connection.request();
            let binaryPhoto = null;
            
            if (updatedArticle.photo) {
                binaryPhoto = Buffer.from(updatedArticle.photo, 'base64');
            }
            
            request.input("articleId", sql.Int, articleId);
            request.input("photo", sql.VarBinary, binaryPhoto);
            request.input("title", sql.NVarChar, updatedArticle.title);
            request.input("content", sql.NVarChar, updatedArticle.content);
            request.input("publicationDate", sql.DateTime2, updatedArticle.publicationDate);

            await request.query(sqlQuery);
            return await this.getArticleById(articleId); // Fetch and return the updated article
        } catch (error) {
            console.error('Error updating article:', error);
            throw new Error('Error updating article'); // Throw a specific error message
        } finally {
            if (connection) {
                await connection.close(); // Ensure the connection is properly closed
            }
        }
    }

    static async deleteArticle(articleId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `DELETE FROM Articles WHERE articleId = @articleId`;
            const request = connection.request();
            request.input("articleId", sql.Int, articleId);
            
            console.log(`Executing query: ${sqlQuery} with articleId = ${articleId}`);
            const result = await request.query(sqlQuery);
            
            console.log('Rows affected:', result.rowsAffected);
            
            return result.rowsAffected[3] > 0;
        } catch (error) {
            console.error('Error deleting article:', error);
            throw new Error("Error deleting article");
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

    static async addFavouriteArticle(userId, articleId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `INSERT INTO UserFavouriteArticles (normalUserId, articleId) VALUES (@userId, @articleId)`;
            const request = connection.request();
            request.input("userId", sql.Int, userId);
            request.input("articleId", sql.Int, articleId);
            await request.query(sqlQuery);
            return true;
        } catch (error) {
            console.error('Error adding favourite article:', error);
            throw new Error('Error adding favourite article');
        } finally {
            // if (connection) await connection.close();
        }
    }

    static async removeFavouriteArticle(userId, articleId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `DELETE FROM UserFavouriteArticles WHERE normalUserId = @userId AND articleId = @articleId`;
            const request = connection.request();
            request.input("userId", sql.Int, userId);
            request.input("articleId", sql.Int, articleId);
            await request.query(sqlQuery);
            return true;
        } catch (error) {
            console.error('Error removing favourite article:', error);
            throw new Error('Error removing favourite article');
        } finally {
            // if (connection) await connection.close();
        }
    }

    static async getFavouriteArticles(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT A.* FROM Articles A
                              JOIN UserFavouriteArticles F ON A.articleId = F.articleId
                              WHERE F.normalUserId = @userId`;
            const request = connection.request();
            request.input("userId", sql.Int, userId);
            const result = await request.query(sqlQuery);
    
            return result.recordset.map(row => {
                const photoBase64 = row.photo ? row.photo.toString('base64') : null; // Convert photo to base64
                return new Article(
                    row.articleId,
                    photoBase64,
                    row.title,
                    row.userId,
                    row.content,
                    row.publicationDate
                );
            });
        } catch (error) {
            console.error("Error fetching favourite articles: ", error);
            throw new Error("Error fetching favourite articles");
        } finally {
            // if (connection) await connection.close();
        }
    }
    

    static async isFavouriteArticle(userId, articleId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT COUNT(*) as count FROM UserFavouriteArticles WHERE normalUserId = @userId AND articleId = @articleId`;
            console.log('Executing query:', sqlQuery);
            const request = connection.request();
            request.input("userId", sql.Int, userId);
            request.input("articleId", sql.Int, articleId);
            const result = await request.query(sqlQuery);
            console.log('Query result:', result);
            return result.recordset[0].count > 0;
        } catch (error) {
            console.error('Error checking favourite article:', error);
            throw new Error('Error checking if article is favourite');
        } finally {
            // if (connection) await connection.close();
        }
    }

    static async getArticlesByUser(userId) {
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
                WHERE userId = @userId
            `;
            const request = connection.request();
            request.input("userId", sql.Int, userId);
            const result = await request.query(sqlQuery);

            const articles = result.recordset.map(record => {
                const photoBase64 = record.photo ? record.photo.toString('base64') : null; // Convert photo to base64
                return new Article(
                    record.articleId,
                    photoBase64,
                    record.title,
                    record.userId,
                    record.content,
                    record.publicationDate
                );
            });

            return articles;
        } catch (error) {
            console.error('Error getting articles by user:', error);
            throw new Error("Error getting articles by user");
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

module.exports = Article;
