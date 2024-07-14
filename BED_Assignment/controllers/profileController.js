// profileController.js

const sql = require('mssql');
const dbConfig = require('../dbConfig');

// Function to fetch user profile from database
async function fetchUserProfile(userId) {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT name, email FROM Users WHERE userId = @userId');

        return result.recordset[0]; // Assuming only one user is fetched
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

module.exports = {
    fetchUserProfile
};
