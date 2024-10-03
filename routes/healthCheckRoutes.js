//const express = require('express');
import express from 'express';
//const { healthCheck } = require('../controllers/healthCheckController');
import * as healthz from '../controllers/healthCheckController.js';
//utilize response handler for sending responses
import { sendErrorResponse } from '../controllers/responseHandler.js';
//const { sendErrorResponse } = require('../controllers/responseHandler');
export const healthRoutes = express.Router();

healthRoutes.head('', (request, response) => {
  return sendErrorResponse(response, 405, 'Method not allowed');
});

// Health check route, allowing only GET requests with /healthz endpoint
healthRoutes.get('', healthz.healthCheck);

// Handle unsupported methods
healthRoutes.all('', healthz.healthCheckInvalidMethods)
// healthRoutes.all('', (request, response) => {
//   return sendErrorResponse(response, 405, 'Method not allowed');
// });

//Handle wrong routes
healthRoutes.all("*", healthz.healthCheckAllMethods);
// healthRoutes.all("*", (request, response) => {
//   return sendErrorResponse(response, 404, 'Invalid request');
//   });

export default healthRoutes;