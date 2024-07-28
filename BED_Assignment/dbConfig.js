import dotenv from "dotenv"
dotenv.config();

module.exports = {
    user: process.env.DB_USER || "bed_tester", 
    password: process.env.DB_PASSWORD || "bed_tester123", 
    server: process.env.DB_SERVER || "localhost",
    database: process.env.DB_NAME || "bed_assignment",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
  };
  