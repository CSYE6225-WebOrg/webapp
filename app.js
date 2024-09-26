//Defining the app and entry point(route)
require('dotenv').config();
const express = require('express');
const healthRoutes = require('./routes/healthRoutes.js');

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// API routes(entry points)
app.use('/', healthCheckRoutes);

module.exports = app;