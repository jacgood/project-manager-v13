const express = require('express');

const app = express();
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./db');

require('dotenv').config();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

connectDB();

app.use('/api/users', require('./routes/api/users'));
app.use('/api/projects', require('./routes/api/projects'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`); // eslint-disable-line
});
