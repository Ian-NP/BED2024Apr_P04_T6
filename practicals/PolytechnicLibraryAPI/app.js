import express from "express";
import bodyParser from "body-parser";
import sql from "mssql";
import dbConfig from "./dbConfig"
import path from 'path';
import userController from "./controllers/usersController"
import bookController from "./controllers/booksController"
import registerUserValidation from "./middlewares/RegisterUserValidation"
import tokenAuthorization from "./middlewares/tokenAuthorization"
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const staticMiddleware = express.static("./public");

app.use(bodyParser.json({ limit: '400mb' }));
app.use(bodyParser.urlencoded({ limit: '400mb', extended: true }));
app.use(staticMiddleware);

app.get("/login", async (req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/login.html"));
});
app.get("/register", async (req, res) =>{
    res.sendFile(path.join(__dirname + "/public/html/register.html"));
})
app.get("/", async (req, res) =>{
    res.sendFile(path.join(__dirname + "/public/html/index.html"));
})
app.get("/home", async(req, res) =>{
    res.sendFile(path.join(__dirname + "/public/html/index.html"));
})

app.get("/api/users", userController.getAllUsers);
app.post("/api/users/register", registerUserValidation, userController.registerUser);
app.post("/api/users/login", userController.loginUser);
app.get("/books", tokenAuthorization, bookController.getAllBooks);
app.put("/books/:bookId/availability", tokenAuthorization, bookController.updateBook);

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