 import { checkDbConnection } from '../services/connectionService.js';
 import { sendResponse, sendErrorResponse } from './responseHandler.js';
 import logger from '../winstonLogger.js'
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
    logger.warn('Bad request: invalid content-type or request body/query params present');
    return sendErrorResponse(response, 400, 'Bad Request');
  }

  // Check the database connection
  const dbConnected = await checkDbConnection();

  if (dbConnected) {
    logger.info('Successful healthz GET method');
    return sendResponse(response, 200);
  } else {
    logger.error('Database connection failed');
    return sendErrorResponse(response, 503, 'Service Unavailable');
  }
} catch (error) {
  logger.error('Error in health check method');
  console.error('Error in health check:', error);
  return sendErrorResponse(response, 500, 'Internal Server Error');
}
};

//deny methods other than GET
export const healthCheckInvalidMethods = (request, response) => {
  if (request.method != "GET") {
    logger.info('In healthz, method except GET is not allowed. 405 response')
    return sendErrorResponse(response, 405, 'Method not allowed');
  }
};

export const healthCheckAllMethods = (request, response) => {
  logger.info("Wrong route sent for healthz methods");
    return sendErrorResponse(response, 405, 'Method not allowed');
  
};
export default {
  healthCheck,
  healthCheckAllMethods
};