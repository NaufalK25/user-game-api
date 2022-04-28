const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const swagger = express.Router();

swagger.use('/api-docs', swaggerUi.serve);
swagger.get('/api-docs', swaggerUi.setup(swaggerDocument));

module.exports = swagger;
