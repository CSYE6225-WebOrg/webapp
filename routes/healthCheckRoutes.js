const express = require('express');
const { healthCheck } = require('../controllers/healthCheckController');
//utilize response handler for sending responses
const { sendErrorResponse } = require('../controllers/responseHandler');
const router = express.Router();

// Health check route, allowing only GET requests with /healthz endpoint
router.get('/healthz', healthCheck);

// Handle unsupported methods
router.all('/healthz', (request, response) => {
  return sendErrorResponse(response, 405, 'Method not allowed');
});

//Handle wrong routes
router.all("*", (request, response) => {
  return sendErrorResponse(response, 404, 'Invalid request');
  });
module.exports = router;