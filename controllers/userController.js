// controllers/userController.js

import * as encryption from '../utils/encrypt.js';
import User from '../models/user.js';
import Image from '../models/image.js';
import { checkDbConnection } from '../services/connectionService.js';
import { sendResponse, sendSuccessResponse,sendErrorResponse } from './responseHandler.js';
import *  as userService from '../services/userService.js';
import * as s3Service from '../services/s3Service.js';
import logger from '../winstonLogger.js';

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
    logger.info("Unsopported payload, hence not processed");
    sendErrorResponse(response, 415, 'payload not supported');
    return;
  }
  const { email, password, firstName, lastName } = request.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName) {
    logger.error("Bad Request: Missing required fields to process the request");
    return sendErrorResponse(response, 400, 'Missing required fields.');
  }
  //Validate email
  if(!userService.validateMail(email)){
    logger.info("Invalid email, hence not processed");
    return sendErrorResponse(response, 400, 'Invalid email');
  }

  //Check for auth fields
  const authorizationHeader = request.headers.authorization;

    if (authorizationHeader) {
      //response.status(401).send();
      logger.info("Request has invalid header parameters");
      sendErrorResponse(response, 401, 'Invalid Request');
      return;
    }

  try {
    // Check if user with the email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      logger.error("Bad Request: User already exists");
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
    logger.info("New user created");
    return sendSuccessResponse(response, 201, userData);
  } catch (error) {
    logger.error("Error creating new user");
    console.error('Error creating user:', error);
    return sendErrorResponse(response, 500, 'Internal Server Error: Unable to create user.');
  }


};

export const getUser = async (request, response) => {
  const dbConnection = await checkDbConnection();
  //Service unavailable if database is not connected
  if (!dbConnection) {
    logger.error("Error: Database not connected");
    sendErrorResponse(response, 503, 'Service Unavailable');
    return;
  } else {
    try {
      
      const authorizationHeader = request.headers.authorization;
      //Unauthorized user
      if (!authorizationHeader) {
        logger.error("Error: Unauthorized user");
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
      logger.warn('Bad request: invalid content-type or request body/query params present');
       sendErrorResponse(response, 400, 'Bad Request');
        return;
      }
      //User is authorized
  const user = request.user;  // User has been added by the authenticator

  // Exclude the password from the response
  const { password: _, ...userData } = user.toJSON();
  logger.info("Authorized user");

  return sendSuccessResponse(response, 200, userData);
} catch (error) {
  logger.error("Error: Database not connected");
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
        loggger.info("Bad Request: Head options method/Params not allowed");
        response.status(400).send();
        return;
      }

     
    const { email, password, firstName, lastName, ...otherFields} = request.body;

  // Validate required fields
  // if (!password || !firstName || !lastName) {
  //   return sendErrorResponse(response, 400, 'Missing required fields.');
  // }

  if ((!password && !firstName && !lastName) || otherFields.length > 0) {
    logger.error("Missing required fields");
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
      loggger.info("Bad Request: User email cannot be updated");
      return sendErrorResponse(response, 400, 'Email cannot be updated');
    }

    // Save updated user
    await user.save();

    // Exclude the password from the response
    const { password: _, ...userData } = user.toJSON();
    logger.info("Success: User updated");
    return sendResponse(response, 204, '');
  } catch (error) {
    logger.error('Error updating user:', error);
    console.error('Error updating user:', error);
    return sendErrorResponse(response, 500, 'Internal Server Error: Unable to update user.');
  }
};

//deny other methods
export const userInvalidMethods = (request, response) => {
  logger.info("Bad Request: Method not allowed 405 response");
    return sendErrorResponse(response, 405, 'Method not allowed');
};


export const uploadPic = async (request, response) => {
 // const userId = request.headers['user-id']; // Assuming user ID is provided in headers
  const file = request.file;
  const dbConnection = await checkDbConnection();

  if (!dbConnection) {
    logger.error("Database service unavailable");
    sendErrorResponse(response, 503, 'Service Unavailable');
    return;
  } else {
    try {
      
      const authorizationHeader = request.headers.authorization;
      const user =request.user;
    
      //Unauthorized user
      if (!authorizationHeader) {
        logger.error("Bad Request: Missing Auth fields");
        sendErrorResponse(response, 400, 'Missing Authorization field');
        return;
      }

  if (!user || !file) {
    logger.error("User and pic are required");
    return response.status(400).json({ error: 'User ID and file are required' });
  }

  try {

    const existingImage = await Image.findOne({ where: { user_id: user.id } });

    if (existingImage) {
      // Option A: Update the existing record
      await s3Service.deleteFile(user.id); // Delete the existing file from S3
      await existingImage.destroy(); // Remove the existing record from the database
    }



    // Upload file to S3
    const s3Key = await s3Service.uploadFile(file, user.id);
    // const url = `${process.env.S3_BUCKET_NAME}/${s3Key}`
    const url = `${s3Key.Location}`
    

    // Store image metadata in the database
    const newImage = await Image.create({
      file_name: file.originalname,
      url,
      user_id: user.id,
    });

    logger.info("Image uploaded successfully");
    response.status(201).json({
      message: 'Image uploaded successfully',
      data: newImage
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    logger.error('Error uploading image:', error);
    response.status(500).json({ error: 'Failed to upload image' });
  }
}
catch(error){
  console.error('Error uploading image:', error);
  logger.error('Error uploading image:', error);
  response.status(500).json({ error: 'Failed to upload image' });
}
  }
};

export const getPic = async (request, response) => {
  const userId = request.user.id;

  try {
    const imageRecord = await Image.findOne({ where: { user_id: userId } });
    if (!imageRecord){ 
      logger.error('Image not found', error);
      return response.status(404).json({ error: 'Image not found' });
    }
    // Generate presigned URL
    const url = await s3Service.getFileUrl(userId);
    logger.info("Generated presigned url");
    response.status(200).json({ url:url });
  } catch (error) {
    logger.error('Error generating presigned URL:', error);
    console.error('Error generating presigned URL:', error);
    response.status(500).json({ error: 'Failed to generate URL' });
  }
};

export const deletePic = async (request, response) =>{
  const userId = request.user.id;
  try {
    const imageRecord = await Image.findOne({ where: { user_id: userId } });
    if (!imageRecord){ 
      logger.error('Image not found', error);
      return response.status(404).json({ error: 'Image not found' });
    }
    // Delete from S3 and then remove database record
    await s3Service.deleteFile(userId);
    await imageRecord.destroy();
    logger.info('image deleted successfully');
    response.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    logger.error('Error deleting image:', error);
    console.error('Error deleting image:', error);
    response.status(500).json({ error: 'Failed to delete image' });
  }
};