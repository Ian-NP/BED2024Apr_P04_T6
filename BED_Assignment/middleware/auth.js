const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Token received:', token); 

    if (!token) {
        console.log('No token provided'); 
        next(); 
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log('Token decoded:', decoded);
            next(); 
        } catch (error) {
            console.log('Invalid token:', error); 
            next(); 
        }
    }
};

module.exports = authenticateToken;
