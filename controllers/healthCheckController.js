 import { checkDbConnection } from '../services/connectionService.js';
 import { sendResponse, sendErrorResponse } from './responseHandler.js';
 import logger from '../winstonLogger.js'
 import statsd from '../metrics.js';
// Health check controller with try catch
export const healthCheck = async (request, response) => {
  const startTime = Date.now();
  statsd.increment('api.healthcheck.calls');
  try {
    const contentTypeLength = request.get("content-type")
    ? request.get("content-type").length
    : 0;
  // Ensuring payload criteria is met
  if (contentTypeLength != 0 ||
    Object.keys(request.body).length != 0 ||
    Object.keys(request.query).length != 0) {
    logger.error({
      message: "Error: Bad Request",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 400,
      }
  })
    return sendErrorResponse(response, 400, 'Bad Request');
  }

  // Check the database connection
  const startDTime = Date.now();
  statsd.increment('db.check_db.query_time.call');
  const dbConnected = await checkDbConnection();
  statsd.timing('db.check_db.query_time', Date.now()- startDTime);

  if (dbConnected) {
    logger.info({
      message: "INFO:Successful healthz GET method",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 200,
      }
  })
    return sendResponse(response, 200);
  } else {
    logger.error({
      message: "Error: Database connection failed",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 503,
      }
  })
    return sendErrorResponse(response, 503, 'Service Unavailable');
  }
} catch (error) {
  logger.error({
    message: "Error: Error in health check method",
    httpRequest: {
        requestMethod: request.method,
        requestUrl: request.originalUrl,
        status: 500,
    }
})
  console.error('Error in health check:', error);
  return sendErrorResponse(response, 500, 'Internal Server Error');
}
finally{
  const duration = Date.now() - startTime; // Calculate duration
  statsd.timing('api.healthcheck.response_time', duration); // Log API call duration
}
};

//deny methods other than GET
export const healthCheckInvalidMethods = (request, response) => {
  const startTime = Date.now();
  statsd.increment('api.healthcheck.calls');
  if (request.method != "GET") {
    logger.error({
      message: "Error: method except GET is not allowed",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 405,
      }
  })
  const duration = Date.now() - startTime; // Calculate duration
  statsd.timing('api.healthcheck.response_time', duration); // Log API call duration
    return sendErrorResponse(response, 405, 'Method not allowed');
  }
};

export const healthCheckAllMethods = (request, response) => {
  const startTime = Date.now();
  statsd.increment('api.healthcheck.calls');
  logger.error({
    message: "Error: Wrong route sent for healthz methods",
    httpRequest: {
        requestMethod: request.method,
        requestUrl: request.originalUrl,
        status: 405,
    }
})
const duration = Date.now() - startTime; // Calculate duration
statsd.timing('api.healthcheck.response_time', duration); // Log API call duratio
    return sendErrorResponse(response, 405, 'Method not allowed');
  
};
export default {
  healthCheck,
  healthCheckAllMethods
};