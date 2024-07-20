//import dotenv from 'dotenv';
//dotenv.config();
require('dotenv').config();
import express from "express";
import bodyParser from "body-parser";
import sql from "mssql";
import dbConfig from "./dbConfig"
import path from 'path';
import multer from "multer";

// Importing Controllers
import articleCommentController from "./controllers/articleCommentsController"
import eventCommentController from "./controllers/eventCommentsController"
import chatBotController from "./controllers/chatBotController"
import EventController from "./controllers/eventController"
import userController from "./controllers/userController"
import adminController from "./controllers/adminController"

// Importing middleware
const {validateUser} = require("./middleware/validateUser");
const {validateAdmin} = require("./middleware/validateUser");
// import validateUser from './middleware/validateUser';
import validateComment from './middleware/validateComment'
import authenticateToken from "./middleware/auth";
import specialAuthenticateToken from "./middleware/specialAuth";
import { validateAddNewConversation, validateEditConversationTitle, validateAddChatHistory } from "./middleware/validateBot"
import eventPaymentController from "./controllers/eventPaymentController";
import articleController from "./controllers/articleController"; 
import refreshToken from "./controllers/refreshToken";
import gameController from "./controllers/gameController";
import highscoreController from "./controllers/highscoreController";
const app = express();
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3001;
const staticMiddleware = express.static("./public"); // Path to the public folder

//const multer = require('multer');
const fs = require('fs');
//const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.json({ limit: '400mb' }));
app.use(bodyParser.urlencoded({ limit: '400mb', extended: true }));
app.use(staticMiddleware);


// Routes
//Routes for users
app.get("/users", userController.getAllUsers);
app.get("/users/:userId", userController.getUserByUserId);
app.post("/users", validateUser, userController.createUser);
app.put("/users/:userId", validateUser, userController.updateUser);
app.delete("/users/:userId", userController.deleteUserById);


//Routes for user login to login user
app.post('/userlogin', userController.loginUser);
app.post('/companylogin', userController.loginUser);
app.post('/adminlogin', adminController.loginUser);


app.post('/createadmin', adminController.createAdminUser);


//Routes for events
app.post('/create-event', specialAuthenticateToken, EventController.createEvent);

// Serve protected.html for /events route, i used this for the js to authenticate before serving
app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/html/protected.html'));
});
// myEvents.html page
app.get('/api/events/userEvents', specialAuthenticateToken, EventController.getEventsByUserId);

app.get('/myEvents', async(req, res) => {res.sendFile(path.join(__dirname + "/public/html/myEvents.html"))});

// events-content is the route for the events page, so basically after protected.html is served, the js will fetch the events-content with the token, the middleware can then authenticate it.
app.get('/events-content', specialAuthenticateToken, EventController.serveEventsContent);

app.post('/api/:eventId/signup', specialAuthenticateToken, EventController.signUserUp);

app.get("/api/events", EventController.getAllEvents);
app.get("/api/events/:eventId", EventController.getEventById);
app.post('/api/events', specialAuthenticateToken, EventController.createEvent);
app.patch('/api/:eventId/leave', specialAuthenticateToken, EventController.updateEventAttendance);
app.delete("/api/events/:eventId/kick/:userId", authenticateToken, (req, res, next) => {
    console.log('Kick request received:', req.params);
    EventController.updateEventAttendance(req, res, next);
  });
app.delete("/api/events/:eventId", specialAuthenticateToken, EventController.deleteEvent);

//paypal stuff
app.post('/api/events/:eventId/authorize', specialAuthenticateToken, eventPaymentController.authorizePayment);
app.post('/api/events/:eventId/capture', eventPaymentController.capturePayment);


// refreshToken Routes
app.delete('/refreshToken', (req, res) => { refreshToken.removeToken(req, res) });
app.get("/refreshToken", async(req, res) => {  refreshToken.refreshToken(req, res)});    
app.post("/refreshToken", async(req, res) => {refreshToken.addToken(req, res)});


// Game routes
app.get('/game', async(req, res) => { res.sendFile(path.join(__dirname + "/public/html/game.html")) });

app.post('/save-game', authenticateToken, gameController.saveGame);
app.get('/get-games', authenticateToken, gameController.getGames);

// Highscore routes
app.get('/get-high-scores', authenticateToken, highscoreController.getHighScores);
app.post('/create-high-score', authenticateToken, highscoreController.createHighScore);
//Ends here

app.get("/signup", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/signup.html"));
});

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

app.get("/updateaccount", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/updateaccount.html"));
});

app.get("/manageevents", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/manageevents.html"));
});

app.get("/manageblogs", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/manageblogs.html"));
});

app.get("/", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/index.html"));
});

app.get("/statistics", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/statistics.html"));
});

app.get("/article/:articleId/comments", async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/comment.html"));
});

app.get("/event/:eventId/comments", async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/comment.html"));
});

app.get("/chatbot", async (req, res) =>{
    res.sendFile(path.join(__dirname + "/public/html/chatbot.html"))
});

app.get("/credits", async(req, res) =>{
    res.sendFile(path.join(__dirname + "/public/html/credits.html"))
});



// Backend routes for comments
app.get("/api/article/comment/:commentId", articleCommentController.getArticleCommentById);
app.get("/api/article/:articleId/comments/latest", articleCommentController.getAllCommentsFromArticleIdByLatest);
app.get("/api/article/:articleId/comments/relevance", articleCommentController.getAllCommentsFromArticleIdByRelevance);
app.post("/api/article/:articleId/comments", validateComment, articleCommentController.createArticleComment);
app.put("/api/article/:articleId/comments", validateComment, articleCommentController.updateArticleCommentContent);
app.delete("/api/article/:articleId/comments", articleCommentController.deleteArticleComment);

app.get("/api/event/comment/:commentId", eventCommentController.getEventCommentById);
app.get("/api/event/:eventId/comments/latest", eventCommentController.getAllCommentsFromEventIdByLatest);
app.get("/api/event/:eventId/comments/relevance", eventCommentController.getAllCommentsFromEventIdByRelevance);
app.post("/api/event/:eventId/comments", validateComment, eventCommentController.createEventComment);
app.put("/api/event/:eventId/comments", validateComment, eventCommentController.updateEventCommentContent);
app.delete("/api/event/:eventId/comments", eventCommentController.deleteEventComment);

// Backend routes for chatbot
app.get("/api/chatbot/:conversationId", authenticateToken,  chatBotController.fetchChatHistory);
app.post("/api/chatbot/:conversationId", authenticateToken, validateAddChatHistory, chatBotController.postUserInput);

app.get("/api/chatConversation/:userId", authenticateToken, chatBotController.fetchChatConversationsByUserId);
app.post("/api/chatConversation/:userId", authenticateToken, validateEditConversationTitle, chatBotController.addNewConversation);
app.put("/api/chatConversation/:conversationId", authenticateToken, validateEditConversationTitle, chatBotController.editConversationTitle);
app.delete("/api/chatConversation/:conversationId", authenticateToken, chatBotController.deleteChatConversation);

// app.get("/api/chatbot/:conversationId", chatBotController.fetchChatHistory);
// app.post("/api/chatbot/:conversationId", validateAddChatHistory, chatBotController.postUserInput);

// app.get("/api/chatConversation/:userId", chatBotController.fetchChatConversationsByUserId);
// app.post("/api/chatConversation/:userId", validateAddNewConversation, chatBotController.addNewConversation);
// app.put("/api/chatConversation/:conversationId", validateEditConversationTitle, chatBotController.editConversationTitle);
// app.delete("/api/chatConversation/:conversationId", chatBotController.deleteChatConversation);

//Routes for admin accounts
app.get("/admin", adminController.getAllAdminUsers);
app.get("/admin/:adminId", adminController.getAdminById);
app.post("/admin", validateAdmin, adminController.createAdminUser);
app.put("/admin/:adminId", validateAdmin, adminController.updateAdminUser);
app.delete("/admin/:adminId", adminController.deleteAdminById);

// Routes for articles
app.get('/article', async (req, res) => {
    res.sendFile(path.join(__dirname, "/public/html/article.html"));
});

app.get('/articleCreateBlog', async (req, res) => {
    res.sendFile(path.join(__dirname, "/public/html/articleCreateBlog.html"));
});

app.get('/articleIndividual', async (req, res) => {
    res.sendFile(path.join(__dirname, "/public/html/articleIndividual.html"));
});

app.get('/profile', async (req, res) => {
    res.sendFile(path.join(__dirname, "/public/html/profile.html"));
});

app.get("/api/article", articleController.getAllArticles);
app.post("/create-blog", articleController.createArticle);
app.post("/api/article", authenticateToken, articleController.createArticle);
app.get("/api/article/:articleId", articleController.getArticleById);
app.get("/api/article/:title", articleController.getArticleByTitle);
app.put("/api/article/:articleId", articleController.updateArticle);
app.delete("/api/article/:articleId", articleController.deleteArticle);

// app.get('/api/profile', authenticateToken, (req, res) => {
//     // Fetch user data from your database based on req.user.id
//     const userId = req.user.id;
//     // Example SQL query:
//     // const query = `SELECT name, email, profilePicture FROM users WHERE id = ${userId}`;
    
//     // Replace with your actual database query
//     const userData = {
//         name: 'User Name',
//         email: 'user@example.com',
//         profilePicture: './images/default-profile-user.jpg'
//     };

//     res.json(userData);
// });

app.get('/api/profile/:userId', userController.getUserProfileByUserId);
app.get('/api/profilePicture/:userId', userController.fetchProfilePicture);
app.post('/api/uploadProfilePicture/:userId', authenticateToken, upload.single('profilePicture'), userController.uploadProfilePicture);

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