// authService.js

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

const generateToken = (user) => {
    const payload = {
        userId: user.id,
        userType: user.type,
        userEmail: user.email,
        userName: user.name,
    };

    const options = {
        expiresIn: '1h' // Token expiration time
    };

    return jwt.sign(payload, secret, options);
};

module.exports = { generateToken };
