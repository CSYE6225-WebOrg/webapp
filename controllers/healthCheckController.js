const { checkDbConnection } = require('../services/dbService');
const { sendResponse, sendErrorResponse } = require('./responseHandler');

// Health check controller with try catch
const healthCheck = async (request, response) => {
  try {
    const contentTypeLength = request.get("content-type")
    ? request.get("content-type").length
    : 0;
  // Ensuring payload criteria is met
  if (contentTypeLength != 0 ||
    Object.keys(request.body).length != 0 ||
    Object.keys(request.query).length != 0) {
    return sendResponse(response, 400, 'Bad Request');
  }

  // Check the database connection
  const dbConnected = await checkDbConnection();

  if (dbConnected) {
    return sendResponse(response, 200);
  } else {
    return sendErrorResponse(response, 503, 'Service Unavailable');
  }
} catch (error) {
  console.error('Error in health check:', error);
  return sendErrorResponse(response, 501, 'Internal Server Error');
}
};

module.exports = {
  healthCheck,
};