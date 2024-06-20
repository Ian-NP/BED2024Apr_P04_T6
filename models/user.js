const sql = require("mssql");
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

    static async createUser(newUserData) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `INSERT INTO [Users] (email, name, password) VALUES (@email, @name, @password); SELECT SCOPE_IDENTITY() AS userId;`; // Retrieve ID of inserted record
    
        const request = connection.request();
        request.input("email", newUserData.email);
        request.input("name", newUserData.name);
        request.input("password", newUserData.password);
    
    
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        // Retrieve the newly created user using its ID
        return this.getUserByUserId(result.recordset[0].userId);
      }

      static async updateUser(userId, newUserData) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `UPDATE [Users] SET email = @email, name = @name WHERE userId = @userId`; // Parameterized query
    
        const request = connection.request();
        request.input("userId", userId);
        request.input("email", newUserData.email || null); // Handle optional fields
        request.input("name", newUserData.name || null);
    
        await request.query(sqlQuery);
    
        connection.close();
    
        return this.getUserByUserId(userId); // returning the updated user data
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

    //   static async getUserByEmail(email) {
    //     const connection = await sql.connect(dbConfig);
    //     const sqlQuery = `SELECT * FROM Users WHERE email = @Email`;
    //     const request = connection.request();
    //     request.input("Email", sql.NVarChar, email);
    //     const result = await request.query(sqlQuery);
    //     connection.close();
    //     if (result.recordset.length === 0) return null;
    //     const row = result.recordset[0];
    //     return new User(row.userId, row.email, row.name, row.password, row.userType);
    // }

    // async validatePassword(password) {
    //     return await bcrypt.compare(password, this.password);
    // }
    
  }
  
  module.exports = User;