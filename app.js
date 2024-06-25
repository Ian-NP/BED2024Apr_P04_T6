import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import sql from "mssql";
import dbConfig from "./dbConfig"
import path from 'path';
import multer from "multer";
import articleCommentController from "./controllers/articleCommentsController"
import eventCommentController from "./controllers/eventCommentsController"
import EventController from "./controllers/eventController"
import userController from "./controllers/userController"
import adminController from "./controllers/adminController"
const validateUser = require("./middleware/validateUser");
//const userController = require('./controllers/userController')
//const bcrypt = require('bcrypt');
import authenticateToken from "./middleware/auth";


const app = express();
const PORT = process.env.PORT || 3001;
const staticMiddleware = express.static("./public"); // Path to the public folder
  

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(staticMiddleware);


// Routes
app.get("/users", userController.getAllUsers);
app.get("/users/:userId", userController.getUserByUserId);
app.post("/users", validateUser, userController.createUser);
app.put("/users/:userId", validateUser, userController.updateUser);
app.delete("/users/:userId", userController.deleteUser);



app.post('/userlogin', userController.loginUser);
app.post('/companylogin', userController.loginUser);
app.post('/adminlogin', adminController.loginUser);
// app.post('/userlogin', validateLoginInput, async (req, res) => {
//     const { email, password } = req.body;
//     console.log('Received login request:', { email, password });

//     try {
//         // Connect to the database
//         const connection = await sql.connect(dbConfig);

//         // Check if user exists
//         const query = 'SELECT * FROM [Users] WHERE email = @email';
//         const request = connection.request();
//         request.input('email', sql.VarChar, email);
//         request.input('password', sql.VarChar, password);
//         const result = await request.query(query);

//         if (result.recordset.length === 0) {
//             return res.status(401).json({ success: false, message: 'Invalid email or password.' });
//         }

//         const user = result.recordset[0];

//         // Compare the provided password with the stored hashed password
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(401).json({ success: false, message: 'Invalid email or password.' });
//         }

//         // Close the database connection
//         await connection.close();

//         // If credentials are valid, send success response with redirect URL
//         res.json({ success: true, message: 'Login successful.', redirectUrl: '/' });

//     } catch (error) {
//         console.error('Error during login:', error);
//         res.status(500).json({ success: false, message: 'Internal server error.' });
//     }
// });

app.post('/createadmin', adminController.createAdminUser);


// Serve protected.html for /events route
app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/html/protected.html'));
});

// Handle content fetching based on token
app.get('/events-content', authenticateToken, EventController.serveEventsContent);

app.get("/signup", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/signup.html"));
});

app.post("/signup", userController.createUser);

app.get("/login", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/login.html"));
});

app.get("/userlogin", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/userlogin.html"));
});

app.get("/companylogin", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/companylogin.html"));
});

app.get("/adminlogin", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/adminlogin.html"));
});

app.get("/adminhomepage", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/adminhome.html"));
});

app.get("/createadmin", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/createadmin.html"));
});

app.get("/viewaccounts", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/viewaccounts.html"));
});

app.get("/manageevents", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/manageevents.html"));
});

app.get("/manageblogs", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/manageblogs.html"));
});

app.get("/", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/home.html"));
});

app.get("/statistics", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/statistics.html"));
});

app.get("/api/events", EventController.getAllEvents);
app.get("/api/events/:eventId", EventController.getEventById);
app.post('/api/events', authenticateToken, EventController.createEvent);
app.get("/api/article/comment/:commentId", articleCommentController.getArticleCommentById);
app.get("/article/:articleId/comments", async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/comment.html"));
});
app.get("/api/article/:articleId/comments", articleCommentController.getAllCommentsFromArticleId);
app.post("/api/article/:articleId/comments", articleCommentController.createArticleComment);
app.put("/api/article/:articleId/comments", articleCommentController.updateArticleCommentContent);
app.delete("/api/article/:articleId/comments", articleCommentController.deleteArticleComment);

app.get("/api/event/:eventId", eventCommentController.getAllCommentsFromEventId);
app.post("/api/event/:eventId", eventCommentController.createEventComment);
app.put("/api/event/:eventId", eventCommentController.updateEventCommentContent);
app.delete("/api/event/:eventId", eventCommentController.deleteEventComment);



app.get("/admin", adminController.getAllAdminUsers);
app.get("/admin/:adminId", adminController.getAdminById);
app.post("/admin", adminController.createAdminUser);
app.put("/admin/:adminId", adminController.updateAdminUser);
app.delete("/admin/:adminId", adminController.deleteAdminUser);

app.listen(PORT, async () => {
    try {
        // Await to connect to the database
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
        console.log(`Your server is running on http://localhost:${PORT}/`)
    } catch(err) {
        console.error("Database connection error:", err);
        // Terminate the application with an error code (optional)
        process.exit(1); // Exit with code 1 indicating an error
    }
})

// Close the connection pool on SIGINT signal
process.on("SIGINT", async() =>{
    console.log("Server is gracefully shutting down");
    // Perform cleanup tasks (eg. close database connections)
    await sql.close();
    console.log("Database connection closed");
    process.exit(0); // Exit with code 0 to indicate successful shutdown
})