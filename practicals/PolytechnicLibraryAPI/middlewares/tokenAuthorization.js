require('dotenv').config();
const jwt = require("jsonwebtoken");

const verifyJWT = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify JWT token
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {          
          if (err) {
                console.error('JWT Verification Error:', err);
                return res.status(403).json({ message: "Forbidden" });
            }

            // Check user role for authorization (replace with your logic)
            const authorizedRoles = {
                "/books": ["member", "librarian"], // Anyone can view books
                "/books/[0-9]+/availability": ["librarian"], // Only librarians can update availability
            };

            const requestedEndpoint = req.url;
            const userRole = decoded.role;

            const authorizedRole = Object.entries(authorizedRoles).find(([endpoint, roles]) => {
                const regex = new RegExp(`^${endpoint}$`); // Create RegExp from endpoint
                return regex.test(requestedEndpoint) && roles.includes(userRole);
            });

            if (!authorizedRole) {
                console.log(decoded);
                return res.status(403).json({ message: "Forbidden" });
            }

            req.user = decoded; // Attach decoded user information to the request object
            next();
        });
    } catch (error) {
        console.error("Error in verifyJWT middleware:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = verifyJWT;
