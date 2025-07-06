// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Computer Education API',
      version: '1.0.0',
      description: 'API documentation for Franchise and Admin Portal',
    },
    components: {
        schemas: {
            Franchise: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
                address: { type: 'string' },
                status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // All route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
