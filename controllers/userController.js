// controllers/userController.js

import * as encryption from '../utils/encrypt.js';
import User from '../models/user.js';
import { checkDbConnection } from '../services/connectionService.js';
import { sendResponse, sendSuccessResponse,sendErrorResponse } from './responseHandler.js';
import *  as userService from '../services/userService.js';

/**
 * createUser - Creates a new user account.
 *
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
export const createUser = async (request, response) => {
  // console.log('Creating user:', request.body);

  //check if request content type is application/json
  const contentType = request.get('content-type');
  if (contentType !== 'application/json') {
    //response.status(400).send();
    sendErrorResponse(response, 415, 'payload not supported');
    return;
  }
  const { email, password, firstName, lastName } = request.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName) {
    return sendErrorResponse(response, 400, 'Missing required fields.');
  }
  //Validate email
  if(!userService.validateMail(email)){
    return sendErrorResponse(response, 400, 'Invalid email');
  }

  //Check for auth fields
  const authorizationHeader = request.headers.authorization;

    if (authorizationHeader) {
      //response.status(401).send();
      sendErrorResponse(response, 401, 'Invalid Request');
      return;
    }

  try {
    // Check if user with the email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return sendErrorResponse(response, 401, 'User with this email already exists.');
    }

    // Hash the password
    const hashedPassword = await encryption.hashPassword(password);

    // Create the user (ignore account_created and account_updated if provided)
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Exclude password from the response
    const { password: _, ...userData } = newUser.toJSON();

    return sendSuccessResponse(response, 201, userData);
  } catch (error) {
    console.error('Error creating user:', error);
    return sendErrorResponse(response, 500, 'Internal Server Error: Unable to create user.');
  }


};

export const getUser = async (request, response) => {
  const dbConnection = await checkDbConnection();
  //Service unavailable if database is not connected
  if (!dbConnection) {
    sendErrorResponse(response, 503, 'Service Unavailable');
    return;
  } else {
    try {
      
      const authorizationHeader = request.headers.authorization;
      //Unauthorized user
      if (!authorizationHeader) {
        sendErrorResponse(response, 400, 'Missing Authorization field');
        return;
      }

      const contentTypeLength = request.get("content-type")
        ? request.get("content-type").length
        : 0;

      if (
        contentTypeLength != 0 ||
        Object.keys(request.body).length != 0 ||
        Object.keys(request.query).length != 0
      ) {
        //Bad request since api is sending a body or has query params
       sendErrorResponse(response, 400, 'Bad Request');
        return;
      }
      //User is authorized
  const user = request.user;  // User has been added by the authenticator

  // Exclude the password from the response
  const { password: _, ...userData } = user.toJSON();

  return sendSuccessResponse(response, 200, userData);
} catch (error) {
  console.error('Error retrieving user information:', error);
  return sendErrorResponse(response, 500, 'Internal Server Error: Unable to retrieve user information.');
}
}};



export const updateUser = async (request, response) => {
  const { firstName, lastName, password } = request.body;

  try {
    const user = request.user;  // User has been added by the authenticator
      //Bad request if body is not in JSON format
      const contentType = request.get("Content-Type");
      if (!contentType || contentType !== "application/json") {
        response.status(400).send();
        return;
      }

     
    const { email, password, firstName, lastName, ...otherFields} = request.body;

  // Validate required fields
  // if (!password || !firstName || !lastName) {
  //   return sendErrorResponse(response, 400, 'Missing required fields.');
  // }

  if ((!password && !firstName && !lastName) || otherFields.length > 0) {
    return sendErrorResponse(response, 400, 'Missing required fields.');
  }

    // Update only allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (password) {
      const hashedPassword = await encryption.hashPassword(password);
      user.password = hashedPassword;
    }
    if(user.email!==email){
      return sendErrorResponse(response, 400, 'Email cannot be updated');
    }

    // Save updated user
    await user.save();

    // Exclude the password from the response
    const { password: _, ...userData } = user.toJSON();

    return sendResponse(response, 204, '');
  } catch (error) {
    console.error('Error updating user:', error);
    return sendErrorResponse(response, 500, 'Internal Server Error: Unable to update user.');
  }
};

//deny other methods
export const userInvalidMethods = (request, response) => {
    return sendErrorResponse(response, 405, 'Method not allowed');
};