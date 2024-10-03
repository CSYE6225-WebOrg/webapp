 import { checkDbConnection } from '../services/connectionService.js';
 import { sendResponse, sendErrorResponse } from './responseHandler.js';
// Health check controller with try catch
export const healthCheck = async (request, response) => {
  try {
    const contentTypeLength = request.get("content-type")
    ? request.get("content-type").length
    : 0;
  // Ensuring payload criteria is met
  if (contentTypeLength != 0 ||
    Object.keys(request.body).length != 0 ||
    Object.keys(request.query).length != 0) {
    return sendErrorResponse(response, 400, 'Bad Request');
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
  return sendErrorResponse(response, 500, 'Internal Server Error');
}
};

//deny methods other than GET
export const healthCheckInvalidMethods = (request, response) => {
  if (request.method != "GET") {
    return sendErrorResponse(response, 405, 'Method not allowed');
  }
};

export const healthCheckAllMethods = (request, response) => {
  
    return sendErrorResponse(response, 405, 'Method not allowed');
  
};
export default {
  healthCheck,
  healthCheckAllMethods
};