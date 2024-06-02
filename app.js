import express from "express";
import bodyParser from "body-parser";
import sql from "mssql";
import path from 'path';


const app = express();
const PORT = process.env.PORT || 3000;
const staticMiddleware = express.static("./public"); // Path to the public folder

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(staticMiddleware);

// Should be in controller
app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/html/home.html"));
});


app.listen(PORT, () =>{
    console.log(`Your server is running on http://localhost:${PORT}/`)
    console.log(`Check out the home page on http://localhost:${PORT}/home`)
})