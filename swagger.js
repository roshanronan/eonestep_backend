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
            instituteName: { type: 'string' },
            phone: { type: 'string' },
            town: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Student: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            studentName: { type: 'string' },
            courseName: { type: 'string' },
            guardianType: { type: 'string' },
            gender: { type: 'string' },
            fatherName: { type: 'string' },
            dob: { type: 'string', format: 'date' },
            pinCode: { type: 'string' },
            town: { type: 'string' },
            district: { type: 'string' },
            state: { type: 'string' },
            idProof: { type: 'string' },
            idNumber: { type: 'string' },
            imageUpload: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            subjectName: { type: 'string' },
            selectFromSession: { type: 'string', format: 'date' },
            selectToSession: { type: 'string', format: 'date' },
            franchise_id: { type: 'integer' }
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
