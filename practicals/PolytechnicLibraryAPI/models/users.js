import sql from "mssql";
import dbConfig from "../dbConfig";

class User {
    constructor(user_id, username, passwordHash, role) {
        this.user_id = user_id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    static async createUser(username, passwordHash, role) {
        const pool = await sql.connect(dbConfig);
    
        try {
            const result = await pool.request()
                .input('username', sql.NVarChar(255), username)
                .input('passwordHash', sql.NVarChar(255), passwordHash)
                .input('role', sql.NVarChar(20), role)
                .query(`
                    INSERT INTO Users (username, passwordHash, role)
                    VALUES (@username, @passwordHash, @role);
    
                    SELECT SCOPE_IDENTITY() AS user_id;
                `);
    
            const user_id = result.recordset[0].user_id;
    
            // Retrieve the newly created user using its ID
            const newUser = await this.getUserById(user_id);
            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        } finally {
            pool.close();
        }
    }
    

    static async getAllUsers() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users`;

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
            (row) => new User(row.user_id, row.username, row.passwordHash, row.role)
        ); // Convert rows to User objects
    }

    static async getUserById(user_id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE user_id = @user_id`;

        const request = connection.request();
        request.input("user_id", user_id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
            ? new User(
                result.recordset[0].user_id,
                result.recordset[0].username,
                result.recordset[0].passwordHash,
                result.recordset[0].role
            )
            : null; // Handle user not found
    }

    static async getUserByUsername(username) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT * FROM Users WHERE username = @username;
            `;
            const request = connection.request();
            request.input("username", username);
            const result = await request.query(sqlQuery);
            connection.close();

            return result.recordset.length > 0 ? new User(result.recordset[0].id, result.recordset[0].username, result.recordset[0].passwordHash, result.recordset[0].role) : null;
        } catch (error) {
            throw new Error("Error fetching user by username: " + error.message);
        }
    }


    static async updateUser(user_id, updatedUser) {
        const connection = await sql.connect(dbConfig);

        // Initialize an array to store the SET clauses
        const setClauses = [];

        // Check if the username is provided in the updatedUser
        if (updatedUser.username) {
            setClauses.push(`username = @username`);
        }

        // Check if the passwordHash is provided in the updatedUser
        if (updatedUser.passwordHash) {
            setClauses.push(`passwordHash = @passwordHash`);
        }

        // Check if the role is provided in the updatedUser
        if (updatedUser.role) {
            setClauses.push(`role = @role`);
        }

        // Construct the SET part of the SQL query
        const setClause = setClauses.join(', ');

        // Construct the complete SQL query
        const sqlQuery = `UPDATE Users SET ${setClause} WHERE user_id = @user_id`;

        const request = connection.request();
        request.input("user_id", user_id);

        // Add input parameters based on provided data
        if (updatedUser.username) {
            request.input("username", updatedUser.username);
        }
        if (updatedUser.passwordHash) {
            request.input("passwordHash", updatedUser.passwordHash);
        }
        if (updatedUser.role) {
            request.input("role", updatedUser.role);
        }

        await request.query(sqlQuery);

        connection.close();

        return this.getUserById(user_id); // returning the updated user data
    }

    static async deleteUser(user_id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `DELETE FROM Users WHERE user_id = @user_id`;

        const request = connection.request();
        request.input("user_id", user_id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.rowsAffected > 0; // Indicate success based on the affected rows
    }

    static async searchUsers(searchTerm) {
        const connection = await sql.connect(dbConfig);

        try {
            const query = `
            SELECT *
            FROM Users
            WHERE username LIKE '%${searchTerm}%'
            OR role LIKE '%${searchTerm}%'
            `;

            const result = await connection.request().query(query);
            return result.recordset;
        } catch (error) {
            throw new Error("Error searching users");
        } finally {
            await connection.close();
        }
    }

    static async getUsersWithBooks() {
        const connection = await sql.connect(dbConfig);

        try {
            const query = `
            SELECT u.user_id, u.username, u.role, b.book_id, b.title, b.author
            FROM Users u
            LEFT JOIN UserBooks ub ON ub.user_id = u.user_id
            LEFT JOIN Books b ON ub.book_id = b.book_id
            ORDER BY u.username;
            `;

            const result = await connection.request().query(query);

            // Group users and their books
            const usersWithBooks = {};
            for (const row of result.recordset) {
                const userId = row.user_id;
                if (!usersWithBooks[userId]) {
                    usersWithBooks[userId] = {
                        user_id: userId,
                        username: row.username,
                        role: row.role,
                        books: [],
                    };
                }
                usersWithBooks[userId].books.push({
                    book_id: row.book_id,
                    title: row.title,
                    author: row.author,
                });
            }

            return Object.values(usersWithBooks);
        } catch (error) {
            throw new Error("Error fetching users with books");
        } finally {
            await connection.close();
        }
    }
}

module.exports = User;
