//Response handler for sending responses and error responses
const sendResponse = (response, statusCode, message = '') => {
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.status(statusCode).send();
  };
  
  const sendErrorResponse = (response, statusCode, message = '') => {
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.status(statusCode).send();
  };
  module.exports = {
    sendResponse,
    sendErrorResponse
  };
  