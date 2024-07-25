const jwt = require('jsonwebtoken');

const secret = 'your_secret';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    

    if (!token) {
        
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
  