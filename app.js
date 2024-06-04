import express from "express";
import bodyParser from "body-parser";
import sql from "mssql";
import dbConfig from "./dbConfig"
import path from 'path';


const app = express();
const port = process.env.PORT || 3000;
const staticMiddleware = express.static("./public"); // Path to the public folder

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(staticMiddleware);

// Should be in controller
app.get("/home", async(req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/home.html"));
});


app.listen(port, async () => {
    try {
        // Await to connect to the database
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
        console.log(`Your server is running on http://localhost:${port}/`)
        console.log(`Check out the home page on http://localhost:${port}/home`)
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