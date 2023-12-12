const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const dbConnectionString = 'mongodb://127.0.0.1:27017/consistify';
mongoose.connect(dbConnectionString, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const users = require('./routes/users');
const habit = require('./routes/habit');
const auth = require('./routes/auth');
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/client')));
app.use(cors());

// Routes without authentication
app.use('/auth', auth);
app.use('/api/users', users);

// Routes requiring authentication
app.use('/api/habits', habit);
app.use('/api/occurrence_habits', habit);

// The "catchall" handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/'));
});

module.exports = app;
