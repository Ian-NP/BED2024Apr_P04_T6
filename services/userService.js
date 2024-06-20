const sql = require('mssql');
const bcrypt = require('bcrypt');
const dbConfig = require('./dbConfig');

// Function to handle user sign-up
async function signUpUser(username, email, password) {
    try {
        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Connect to the database
        await sql.connect(dbConfig);

        // Insert user data into the database
        const query = `
            INSERT INTO Users (username, email, password)
            VALUES (@username, @email, @password)
        `;
        const request = new sql.Request();
        request.input('username', sql.VarChar, username);
        request.input('email', sql.VarChar, email);
        request.input('password', sql.VarChar, hashedPassword);
        await request.query(query);

        // Close the database connection
        await sql.close();

        return { success: true, message: 'User signed up successfully' };
    } catch (error) {
        console.error('Error signing up user:', error);
        return { success: false, message: 'Error signing up user' };
    }
}

// Example usage
signUpUser('john_doe', 'john@example.com', 'password123')
    .then(result => console.log(result))
    .catch(error => console.error(error));
