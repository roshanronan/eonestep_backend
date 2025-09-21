const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./models');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(bodyParser.json());
app.use(errorHandler)

// Swagger Docs Route
// app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use(logger);

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/franchise', require('./routes/franchise.routes'));
app.use('/api/students', require('./routes/student.routes'));

app.get('/', (req, res) => {
   res.redirect('https://eonestep.com');
  });

// Sync DB and start server
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});