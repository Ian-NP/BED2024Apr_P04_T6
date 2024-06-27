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
  

app.use(bodyParser.json({ limit: '400mb' }));
app.use(bodyParser.urlencoded({ limit: '400mb', extended: true }));
app.use(staticMiddleware);


// Routes
//Routes for users
app.get("/users", userController.getAllUsers);
app.get("/users/:userId", userController.getUserByUserId);
app.post("/users", validateUser, userController.createUser);
app.put("/users/:userId", validateUser, userController.updateUser);
app.delete("/users/:userId", userController.deleteUser);


//Routes for user login to login user
app.post('/userlogin', userController.loginUser);
app.post('/companylogin', userController.loginUser);
app.post('/adminlogin', adminController.loginUser);


app.post('/createadmin', adminController.createAdminUser);
app.post('/create-event', EventController.createEvent);

// Serve protected.html for /events route
app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/html/protected.html'));
});
app.get('/api/events/userEvents', authenticateToken, EventController.getEventsByUserId);
// Handle content fetching based on token
app.get('/events-content', authenticateToken, EventController.serveEventsContent);
app.post('/api/:eventId/signup', authenticateToken, EventController.signUserUp);
app.get("/signup", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/signup.html"));
});
app.get('/myEvents', async(req, res) => {res.sendFile(path.join(__dirname + "/public/html/myEvents.html"))});

//Route for user sign up
app.post("/signup", userController.createUser);

//Route for user login
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

//Route for admin homepage
app.get("/adminhomepage", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/adminhome.html"));
});

//Route for creating admin account
app.get("/createadmin", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/createadmin.html"));
});

//Route for admin to view all accounts
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
app.patch('/api/:eventId/leave', authenticateToken, EventController.updateEventAttendance);
app.get("/api/article/comment/:commentId", articleCommentController.getArticleCommentById);
app.get("/article/:articleId/comments", async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/comment.html"));
});
app.get("/api/article/:articleId/comments", articleCommentController.getAllCommentsFromArticleId);
app.post("/api/article/:articleId/comments", articleCommentController.createArticleComment);
app.put("/api/article/:articleId/comments", articleCommentController.updateArticleCommentContent);
app.delete("/api/article/:articleId/comments", articleCommentController.deleteArticleComment);

app.get("/api/event/comment/:commentId", eventCommentController.getEventCommentById);
app.get("/event/:eventId/comments", async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/comment.html"));
});
app.get("/api/event/:eventId/comments", eventCommentController.getAllCommentsFromEventId);
app.post("/api/event/:eventId/comments", eventCommentController.createEventComment);
app.put("/api/event/:eventId/comments", eventCommentController.updateEventCommentContent);
app.delete("/api/event/:eventId/comments", eventCommentController.deleteEventComment);

//Routes for admin accounts
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