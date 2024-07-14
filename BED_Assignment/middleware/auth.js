const jwt = require('jsonwebtoken');


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
        console.error('No token provided');
        return res.sendStatus(401); // Unauthorized: No token provided
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.sendStatus(403); // Forbidden: Invalid token
        }
        
        console.log('Authenticated user:', decoded); // Log authenticated user
        req.user = decoded; // Attach user information to the request object
        next();
    });
};




module.exports = authenticateToken;
  