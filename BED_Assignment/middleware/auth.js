const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Token received:', token); // Debug log

    if (!token) {
        console.log('No token provided'); // Debug log
        next(); // Continue to the next middleware/controller
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log('Token decoded:', decoded); // Debug log
            next(); // Continue to the next middleware/controller
        } catch (error) {
            console.log('Invalid token:', error); // Debug log
            next(); // Continue to the next middleware/controller
        }
    }
};

module.exports = authenticateToken;
