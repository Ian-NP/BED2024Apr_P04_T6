const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'My API',
    description: 'Description of your API',
  },
  host: 'localhost:3001',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc)
  .then(() => {
    console.log('Swagger JSON file created successfully.');
  })
  .catch((err) => {
    console.error('Error generating Swagger JSON file:', err);
  });

console.log('Swagger generation process started...');