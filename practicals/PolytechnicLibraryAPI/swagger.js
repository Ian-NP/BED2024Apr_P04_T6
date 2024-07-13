const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json"; 
const routes = ["./app.js"]; 

const doc = {
  info: {
    title: "My API",
    description: "Description of your API",
  },
  host: "localhost:3001", 
};

swaggerAutogen(outputFile, routes, doc);