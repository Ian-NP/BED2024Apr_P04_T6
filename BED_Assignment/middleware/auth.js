const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     console.log('Token received:', token); 

//     if (!token) {
//         console.log('No token provided'); 
//         return res.sendStatus(401); 
//     } else {
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             req.user = decoded;
//             console.log('Token decoded:', decoded);
//             next(); 
//         } catch (error) {
//             console.log('Invalid token:', error); 
//             next(); 
//         }
//     }
// };

require('dotenv').config(); // Load environment variables

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.sendStatus(403); // Forbidden
        }

        // Token is valid, attach user information to the request object if needed
        req.user = user;
        next();
    });
};




module.exports = authenticateToken;
  