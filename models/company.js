const sql = require("mssql");
const dbConfig = require("../dbConfig");

class CompanyUser {
    constructor(companyId, companyName) {
      this.companyId = companyId;
      this.companyName = companyName;
      
    }
  
    static async getAllCompanyUsers() {
      const connection = await sql.connect(dbConfig);
  
      const sqlQuery = `SELECT * FROM CompanyUser`; // Replace with your actual table name
  
      const request = connection.request();
      const result = await request.query(sqlQuery);
  
      connection.close();
  
      return result.recordset.map(
        (row) => new CompanyUser(row.companyId, row.companyName)
      ); // Convert rows to CompanyUser objects
    }
  
    static async getCompanyById(companyId) {
      const connection = await sql.connect(dbConfig);
  
      const sqlQuery = `SELECT * FROM CompanyUser WHERE companyId = @companyId`; // Parameterized query
  
      const request = connection.request();
      request.input("companyId", companyId);
      const result = await request.query(sqlQuery);
  
      connection.close();
  
      return result.recordset[0]
        ? new CompanyUser(
            result.recordset[0].companyId,
            result.recordset[0].companyName
          )
        : null; // Handle companyUser not found
    }

    static async createCompanyUser(newCompanyUserData) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `INSERT INTO CompanyUser (companyName) VALUES (@companyName); SELECT SCOPE_IDENTITY() AS companyId;`; // Retrieve ID of inserted record
    
        const request = connection.request();
        request.input("companyName", newCompanyUserData.name);
        
    
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        // Retrieve the newly created company user using its ID
        return this.getCompanyById(result.recordset[0].companyId);
      }

      static async updateCompanyUser(companyId, newCompanyUserData) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `UPDATE CompanyUser SET companyName = @companyName WHERE companyId = @companyId`; // Parameterized query
    
        const request = connection.request();
        request.input("companyId", companyId);
        request.input("name", newCompanyUserData.name || null); // Handle optional fields
        
    
        await request.query(sqlQuery);
    
        connection.close();
    
        return this.getCompanyById(companyId); // returning the updated companyUser data
      }
    
      static async deleteCompanyUser(companyId) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `DELETE FROM CompanyUser WHERE companyId = @companyId`; // Parameterized query
    
        const request = connection.request();
        request.input("companyId", companyId);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.rowsAffected > 0; // Indicate success based on affected rows
      }
    
  }
  
  module.exports = CompanyUser;