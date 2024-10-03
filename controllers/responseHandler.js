//Response handler for sending responses and error responses
export const sendResponse = (response, statusCode, message = '') => {
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.status(statusCode).send();
  };

  export const sendSuccessResponse = (response, statusCode, data = {}) => {
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.status(statusCode).json(data);
  };
  
  export const sendErrorResponse = (response, statusCode, message) => {
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.status(statusCode).send(message);
  };
  export default{
    sendResponse,
    sendErrorResponse
  };
  