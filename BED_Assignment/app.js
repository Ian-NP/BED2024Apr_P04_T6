import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import sql from "mssql";
import dbConfig from "./dbConfig"
import path from 'path';
import multer from "multer";

// Importing Controllers
import articleCommentController from "./controllers/articleCommentsController"
import eventCommentController from "./controllers/eventCommentsController"
import EventController from "./controllers/eventController"
import userController from "./controllers/userController"
import adminController from "./controllers/adminController"

// Importing middleware
const validateUser = require("./middleware/validateUser");
// import validateUser from './middleware/validateUser';
import validateComment from './middleware/validateComment'
import authenticateToken from "./middleware/auth";
import eventPaymentController from "./controllers/eventPaymentController";
import articleController from "./controllers/articleController"; 

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


//Routes for events

app.post('/create-event', EventController.createEvent);

// Serve protected.html for /events route, i used this for the js to authenticate before serving
app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/html/protected.html'));
});
// myEvents.html page
app.get('/api/events/userEvents', authenticateToken, EventController.getEventsByUserId);

app.get('/myEvents', async(req, res) => {res.sendFile(path.join(__dirname + "/public/html/myEvents.html"))});

// events-content is the route for the events page, so basically after protected.html is served, the js will fetch the events-content with the token, the middleware can then authenticate it.
app.get('/events-content', authenticateToken, EventController.serveEventsContent);

app.post('/api/:eventId/signup', authenticateToken, EventController.signUserUp);

app.get("/api/events", EventController.getAllEvents);
app.get("/api/events/:eventId", EventController.getEventById);
app.post('/api/events', authenticateToken, EventController.createEvent);
app.patch('/api/:eventId/leave', authenticateToken, EventController.updateEventAttendance);

app.delete("/api/events/:eventId", EventController.deleteEvent);

//paypal stuff
app.post('/api/events/:eventId/authorize', authenticateToken, eventPaymentController.authorizePayment);
app.post('/api/events/:eventId/capture', eventPaymentController.capturePayment);

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




app.get("/api/users/:userId", userController.getUserByUserId);
app.get("/api/article/comment/:commentId", articleCommentController.getArticleCommentById);
app.get("/article/:articleId/comments", async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/comment.html"));
});
app.get("/api/article/:articleId/comments", articleCommentController.getAllCommentsFromArticleId);
app.post("/api/article/:articleId/comments", validateComment, articleCommentController.createArticleComment);
app.put("/api/article/:articleId/comments", validateComment, articleCommentController.updateArticleCommentContent);
app.delete("/api/article/:articleId/comments", articleCommentController.deleteArticleComment);

app.get("/api/event/comment/:commentId", eventCommentController.getEventCommentById);
app.get("/event/:eventId/comments", async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/comment.html"));
});
app.get("/api/event/:eventId/comments", eventCommentController.getAllCommentsFromEventId);
app.post("/api/event/:eventId/comments", validateComment, eventCommentController.createEventComment);
app.put("/api/event/:eventId/comments", validateComment, eventCommentController.updateEventCommentContent);
app.delete("/api/event/:eventId/comments", eventCommentController.deleteEventComment);

//Routes for admin accounts
app.get("/admin", adminController.getAllAdminUsers);
app.get("/admin/:adminId", adminController.getAdminById);
app.post("/admin", adminController.createAdminUser);
app.put("/admin/:adminId", adminController.updateAdminUser);
app.delete("/admin/:adminId", adminController.deleteAdminUser);

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

app.get("/api/article", articleController.getAllArticles);
app.post("/create-blog", articleController.createArticle);
app.post("/api/article", authenticateToken, articleController.createArticle);
app.get("/api/article/:articleId", articleController.getArticleById);
app.get("/api/article/:title", articleController.getArticleByTitle);
app.put("/api/article/:articleId", articleController.updateArticle);
app.delete("/api/article/:articleId", articleController.deleteArticle);


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