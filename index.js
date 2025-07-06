const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./models');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(bodyParser.json());

// Swagger Docs Route
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/franchise', require('./routes/franchise.routes'));
app.use('/api/students', require('./routes/student.routes'));

app.get('/', (req, res) => {
    res.send('Server is running...');
  });

// Sync DB and start server
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});