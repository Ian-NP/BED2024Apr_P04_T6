module.exports = {
    user: process.env.DB_USER || "bed_tester", // Replace with your SQL Server login username
    password: process.env.DB_PASSWORD || "bed_tester123", // Replace with your SQL Server login password
    server: process.env.DB_SERVER || "localhost",
    database: process.env.DB_NAME || "bed_assignment",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
  };
  