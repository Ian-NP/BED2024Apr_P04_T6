  const sql = require("mssql");
  const bcrypt = require("bcrypt");
  const dbConfig = require("../dbConfig");

  class User {
      constructor(userId, email, name, password, userType) {
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.password = password;
        this.userType = userType;
      }
    
      static async getAllUsers() {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `SELECT * FROM [Users]`; // Replace with your actual table name
    
        const request = connection.request();
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.recordset.map(
          (row) => new User(row.userId, row.email, row.name, row.password, row.userType)
        ); // Convert rows to User objects
      }
    
      static async getUserByUserId(userId) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `SELECT * FROM [Users] WHERE userId = @userId`; // Parameterized query
    
        const request = connection.request();
        request.input("userId", userId);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.recordset[0]
          ? new User(
              result.recordset[0].userId,
              result.recordset[0].email,
              result.recordset[0].name,
              result.recordset[0].password,
              result.recordset[0].userType
            )
          : null; // Handle user not found
      }

      static async getUserProfile(userId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query('SELECT name, email, userType, paypalEmail, profilePicture FROM Users WHERE userId = @userId');
    
            return result.recordset[0];
        } catch (error) {
            throw new Error('Database query failed');
        }
      }

      static async getUserProfilePicture(userId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query('SELECT profilePicture FROM Users WHERE userId = @userId');
            pool.close();
            return result.recordset[0];
        } catch (error) {
            throw new Error('Database query failed');
        }
      }
      
      static async updateUserProfilePicture(userId, profilePicture) {
        const pool = await sql.connect(dbConfig);
        try {
          const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('profilePicture', sql.VarBinary(sql.MAX), profilePicture)
            .query('UPDATE Users SET profilePicture = @profilePicture WHERE userId = @userId');
      
          // Check if rows were affected
          if (result.rowsAffected[0] > 0) {
            console.log(`${result.rowsAffected[0]} row(s) updated.`);
            return true; // Update successful
          } else {
            console.log('No rows updated. User not found or profile picture unchanged.');
            return false; // Update unsuccessful
          }
        } catch (error) {
          console.error('Error updating user profile:', error);
          throw new Error('Database update failed');
        } finally {
          pool.close();
        }
      }          

      static async createUser(newUserData) {
        try {
          console.log('Received new user data:', newUserData);
    
          // Hash the user's password
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(newUserData.password, saltRounds);
          
    
          // Connect to the database
          const connection = await sql.connect(dbConfig);
    
          // Insert user data into the database
          const query = `
            INSERT INTO [Users] (email, name, password, userType, paypalEmail)
            VALUES (@Email, @Name, @Password, @UserType, @PaypalEmail);
            SELECT SCOPE_IDENTITY() AS userId;
          `;
          console.log('Executing SQL query:', query); // Log the SQL query
    
          const request = connection.request();
          request.input('Email', sql.VarChar, newUserData.email);
          request.input('Name', sql.VarChar, newUserData.firstName); // Adjusted to use firstName
          request.input('Password', sql.VarChar, hashedPassword);
          request.input('UserType', sql.Char, newUserData.userType);
          request.input('PaypalEmail', sql.VarChar, newUserData.userType === 'C' ? newUserData.paypalEmail : null);
    
          const result = await request.query(query);
    
          // Close the database connection
          await sql.close();
    
          return { success: true, message: 'User signed up successfully', userId: result.recordset[0].userId };
        } catch (error) {
          console.error('Error signing up user:', error);
          throw new Error('Error signing up user'); // Throw an error
      }
      }

      static async updateUser(userId, newUserData) {
        try {
            const connection = await sql.connect(dbConfig);
        
            const sqlQuery = `UPDATE [Users] SET email = @email, name = @name WHERE userId = @userId`;
        
            const request = connection.request();
            request.input("userId", userId);
            request.input("email", newUserData.email || null); // Handle optional fields
            request.input("name", newUserData.name || null);
        
            const result = await request.query(sqlQuery);
        
            connection.close();
            
        
            // Fetch and return the updated user data
            if (result.rowsAffected[0] > 0) {
              return true; // Update successful
          } else {
              return false; // No rows affected
          }
        } catch (error) {
            console.error("Error updating user:", error);
            throw error; // Propagate the error up to the caller
        }
    }
      
        static async deleteUser(userId) {
          const connection = await sql.connect(dbConfig);
      
          const sqlQuery = `DELETE FROM [Users] WHERE userId = @userId`; // Parameterized query
      
          const request = connection.request();
          request.input("userId", userId);
          const result = await request.query(sqlQuery);
      
          connection.close();
      
          return result.rowsAffected > 0; // Indicate success based on affected rows
        }

        static async deleteUserById(userId) {
          const connection = await sql.connect(dbConfig);
          const sqlQuery = `DELETE FROM [Users] WHERE userId = @userId`;
          const request = connection.request();
          request.input("userId", userId);
          const result = await request.query(sqlQuery);
          connection.close();
          return result;
        }

        static async getUserByEmail(email) {
          const connection = await sql.connect(dbConfig);
          const sqlQuery = `SELECT * FROM Users WHERE email = @Email`;
          const request = connection.request();
          request.input("Email", sql.NVarChar, email);
          const result = await request.query(sqlQuery);
          connection.close();
          if (result.recordset.length === 0) return null;
          const row = result.recordset[0];
          return new User(row.userId, row.email, row.name, row.password, row.userType);
      }

      // async validatePassword(password) {
      //     return await bcrypt.compare(password, this.password);
      // }

      static async getUserAboutProfile(userId) {
        try {
          const connection = await sql.connect(dbConfig);
          const sqlQuery = `SELECT * FROM Users WHERE userId = @userId`;
          const request = connection.request();
          request.input("userId", sql.NVarChar, userId);
          const result = await request.query(sqlQuery);
          return result.recordset[0]; // MS SQL returns result in 'recordset'
        } catch (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }
      }
    
      static async updateUserAboutProfile(userId, updates) {
        try {
          const connection = await sql.connect(dbConfig);
          const { about } = updates;
          const sqlQuery = `UPDATE Users SET about = @about WHERE userId = @userId`;
          const request = connection.request();
          request.input("about", sql.NVarChar, about);
          request.input("userId", sql.NVarChar, userId);
          const result = await request.query(sqlQuery);
          return result.rowsAffected[0] > 0;
        } catch (error) {
          console.error('Error updating user profile:', error);
          throw error;
        }
      }
      
    }
    
    module.exports = User;