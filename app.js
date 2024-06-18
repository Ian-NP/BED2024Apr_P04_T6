import express from "express";
import bodyParser from "body-parser";
import sql from "mssql";
import dbConfig from "./dbConfig"
import path from 'path';
import multer from "multer";
import articleCommentController from "./controllers/articleCommentsController"
import eventCommentController from "./controllers/eventCommentsController"
import EventController from "./controllers/eventController"



const app = express();
const PORT = process.env.PORT || 3001;
const staticMiddleware = express.static("./public"); // Path to the public folder
  

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(staticMiddleware);


// Routes
app.get("/events", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/events.html"));
});

app.get("/", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/home.html"));
});

app.get("/statistics", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/statistics.html"));
});

app.get("/api/events", EventController.getAllEvents);
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