const sql = require("mssql");
const bcrypt = require("bcrypt");
const dbConfig = require("../dbConfig");

class Admin {
    constructor(adminId, name, password, adminEmail) {
      this.adminId = adminId;
      this.name = name;
      this.password = password;
      this.adminEmail = adminEmail;
    }
  
    static async getAllAdminUsers() {
      const connection = await sql.connect(dbConfig);
  
      const sqlQuery = `SELECT * FROM AdminUser`; // Replace with your actual table name
  
      const request = connection.request();
      const result = await request.query(sqlQuery);
  
      connection.close();
  
      return result.recordset.map(
        (row) => new Admin(row.adminId, row.name, row.password, row.adminEmail)
      ); // Convert rows to Admin objects
    }
  
    static async getAdminById(adminId) {
      const connection = await sql.connect(dbConfig);
  
      const sqlQuery = `SELECT * FROM AdminUser WHERE adminId = @adminId`; // Parameterized query
  
      const request = connection.request();
      request.input("adminId", adminId);
      const result = await request.query(sqlQuery);
  
      connection.close();
  
      return result.recordset[0]
        ? new Admin(
            result.recordset[0].adminId,
            result.recordset[0].name,
            result.recordset[0].password,
            result.recordset[0].adminEmail
          )
        : null; // Handle admin not found
    }

    static async createAdminUser(newAdminData) {
        // Hash the user's password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newAdminData.password, saltRounds);
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `INSERT INTO AdminUser (name, password, adminEmail) VALUES (@name, @password, @adminEmail); SELECT SCOPE_IDENTITY() AS adminId;`; // Retrieve ID of inserted record
    
        const request = connection.request();
        request.input("name", newAdminData.name);
        request.input("password", hashedPassword);
        request.input("adminEmail", newAdminData.adminEmail);
    
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        // Retrieve the newly created admin user using its ID
        return this.getAdminById(result.recordset[0].adminId);
      }

      static async updateAdminUser(adminId, newAdminData) {
        try {
            const connection = await sql.connect(dbConfig);
        
            const sqlQuery = `UPDATE AdminUser SET name = @name, password = @password, adminEmail = @adminEmail WHERE adminId = @adminId`;
        
            const request = connection.request();
            request.input("adminId", adminId);
            request.input("name", newAdminData.name || null); // Handle optional fields
            request.input("password", newAdminData.password || null);
            request.input("adminEmail", newAdminData.adminEmail || null);
        
            await request.query(sqlQuery);
        
            connection.close();
        
            // Fetch and return the updated admin user data
            const updatedAdminData = await this.getAdminById(adminId);
            return updatedAdminData;
        } catch (error) {
            console.error("Error updating admin user:", error);
            throw error; // Propagate the error up to the caller
        }
    }
    
      static async deleteAdmin(adminId) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `DELETE FROM Adminuser WHERE adminId = @adminId`; // Parameterized query
    
        const request = connection.request();
        request.input("adminId", adminId);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.rowsAffected > 0; // Indicate success based on affected rows
      }

      static async getAdminByEmail(email) {
        console.log('Received email in getAdminByEmail:', email); // Debug log
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM AdminUser WHERE adminEmail = @Email`;
        const request = connection.request();
        request.input("Email", sql.NVarChar, email);
        console.log('Executing SQL query with email:', email);
        const result = await request.query(sqlQuery);
        console.log('SQL query result:', result); // Log the result for inspection
        connection.close();
        if (result.recordset.length === 0) return null;
        const row = result.recordset[0];
        return new Admin(row.adminId, row.name, row.password, row.email,);
    }
    
  }
  
  module.exports = Admin;