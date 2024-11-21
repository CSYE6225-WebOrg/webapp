// controllers/userController.js

import * as encryption from '../utils/encrypt.js';
import User from '../models/user.js';
import Image from '../models/image.js';
import Token from '../models/token.js';
import { checkDbConnection } from '../services/connectionService.js';
import { sendResponse, sendSuccessResponse,sendErrorResponse } from './responseHandler.js';
import *  as userService from '../services/userService.js';
import * as s3Service from '../services/s3Service.js';
import logger from '../winstonLogger.js';
import statsd from '../metrics.js';
import { generateVerificationToken } from '../services/tokenService.js';
import { sendVerificationLinkToLambda } from '../services/snsService.js';

/**
 * createUser - Creates a new user account.
 *
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
export const createUser = async (request, response) => {
  // console.log('Creating user:', request.body);
  logger.info("POST request for user:");
  const startTime = Date.now();
  statsd.increment('api.post.user.calls');

  //check if request content type is application/json
  const contentType = request.get('content-type');
  if (contentType !== 'application/json') {
    //response.status(400).send();
    logger.error({
      message: "Error: Unsopported payload, hence not processed",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 415,
      }
  })
    sendErrorResponse(response, 415, 'payload not supported');
    return;
  }
  const { email, password, firstName, lastName } = request.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName) {
    logger.error({
      message: "Error: Bad Request- Missing required fields to process the request",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 415,
      }
  })
    return sendErrorResponse(response, 415, 'Missing required fields.');
  }
  //Validate email
  if(!userService.validateMail(email)){
    logger.error({
      message: "Error: Invalid email, hence not processed",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 400,
      }
  })
    return sendErrorResponse(response, 400, 'Invalid email');
  }

  //Check for auth fields
  const authorizationHeader = request.headers.authorization;

    if (authorizationHeader) {
      //response.status(401).send();
      logger.error({
        message: "Error: Request has invalid header parameters",
        httpRequest: {
            requestMethod: request.method,
            requestUrl: request.originalUrl,
            status: 401,
        }
    })
      sendErrorResponse(response, 401, 'Invalid Request');
      return;
    }

  try {
    const startDTime = Date.now();
    statsd.increment('db.create_user.call');
    // Check if user with the email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      logger.error({
        message: "Error: Bad Request- User already exists",
        httpRequest: {
            requestMethod: request.method,
            requestUrl: request.originalUrl,
            status: 401,
        }
    })
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

    // Generate verification link using the token service
    var verificationLink = await generateVerificationToken(newUser.id);
    var sendVerification = await sendVerificationLinkToLambda(newUser.email, verificationLink);
    console.log("verification link", verificationLink);

    statsd.timing('db.create_user.query_time', Date.now()- startDTime);

    // Exclude password from the response
    // const { password: _,verified: __, ...userData } = newUser.toJSON();
    const userData = newUser.toJSON();
    delete userData.password;
    delete userData.verified;
    
    logger.info({
      message: "INFO:User created successfully",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 201,
      }
  })
    return sendSuccessResponse(response, 201, userData);
  } catch (error) {
    logger.error({
      message: "Error: Error creating user",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 500,
      }
  })
    console.error('Error creating user:', error);
    return sendErrorResponse(response, 500, 'Internal Server Error: Unable to create user.');
  }
  finally {
    const duration = Date.now() - startTime; // Calculate duration
    statsd.timing('api.post.user.response_time', duration); // Log API call duration
}


};

export const getUser = async (request, response) => {
  const startTime = Date.now();
  statsd.increment('api.get.user.calls');
  const startDTime = Date.now();
  statsd.increment('db.get_user.call');
  const dbConnection = await checkDbConnection();
  //Service unavailable if database is not connected
  if (!dbConnection) {
    statsd.timing('db.get_user.query_time', Date.now()- startDTime);
    const duration = Date.now() - startTime; // Calculate duration
    statsd.timing('api.get.user.response_time', duration); // Log API call duration
    logger.error({
      message: "Error: Database connection failed",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 503,
      }
  })
    sendErrorResponse(response, 503, 'Service Unavailable');
    return;
  } else {
    try {
      
      const authorizationHeader = request.headers.authorization;
      //Unauthorized user
      if (!authorizationHeader) {
        logger.error({
          message: "Error: Missing Authorization field",
          httpRequest: {
              requestMethod: request.method,
              requestUrl: request.originalUrl,
              status: 400,
          }
      })
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
      logger.error({
        message: "Error: invalid content-type or request body/query params present",
        httpRequest: {
            requestMethod: request.method,
            requestUrl: request.originalUrl,
            status: 400,
        }
    })
       sendErrorResponse(response, 400, 'Bad Request');
        return;
      }
      //User is authorized
  const user = request.user;  // User has been added by the authenticator

  // Exclude the password from the response
const userData = user.toJSON();
delete userData.password;
delete userData.verified;
  logger.info({
    message: "INFO:Authorized User",
    httpRequest: {
        requestMethod: request.method,
        requestUrl: request.originalUrl,
        status: 200,
    }
})

  return sendSuccessResponse(response, 200, userData);
} catch (error) {
  logger.error({
    message: "Error: Unable to retrieve user information.",
    httpRequest: {
        requestMethod: request.method,
        requestUrl: request.originalUrl,
        status: 500,
    }
})
  
  console.error('Error retrieving user information:', error);
  return sendErrorResponse(response, 500, 'Internal Server Error: Unable to retrieve user information.');
}
finally {
  const duration = Date.now() - startTime; // Calculate duration
  statsd.timing('api.get.user.response_time', duration); // Log API call duration
}

}};



export const updateUser = async (request, response) => {
  const startTime = Date.now();
  statsd.increment('api.update.user.calls');
  const { firstName, lastName, password } = request.body;

  try {
    const user = request.user;  // User has been added by the authenticator
      //Bad request if body is not in JSON format
      const contentType = request.get("Content-Type");
      if (!contentType || contentType !== "application/json") {

        logger.error({
          message: "Error:  Head options method/Params not allowed",
          httpRequest: {
              requestMethod: request.method,
              requestUrl: request.originalUrl,
              status: 400,
          }
      })
        response.status(400).send();
        return;
      }

     
    const { email, password, firstName, lastName, ...otherFields} = request.body;

  // Validate required fields
  // if (!password || !firstName || !lastName) {
  //   return sendErrorResponse(response, 400, 'Missing required fields.');
  // }

  if ((!password && !firstName && !lastName) || otherFields.length > 0) {
    logger.error({
      message: "Error: Missing required fields",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 400,
      }
  })
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
      logger.error({
        message: "Error: Email cannot be updated",
        httpRequest: {
            requestMethod: request.method,
            requestUrl: request.originalUrl,
            status: 400,
        }
    })
      
      return sendErrorResponse(response, 400, 'Email cannot be updated');
    }

    // Save updated user
    
    const startDTime = Date.now();
    statsd.increment('db.update_user.call');
    await user.save();
    statsd.timing('db.update_user.query_time', Date.now()- startDTime);

    // Exclude the password from the response
    const userData = user.toJSON();
    delete userData.password;
    delete userData.verified;
    logger.info({
      message: "INFO:User updated successfully",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 204,
      }
  })
    return sendResponse(response, 204, '');
  } catch (error) {
    logger.error({
      message: "Error: Unable to update user",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 500,
      }
  })
    console.error('Error updating user:', error);
    return sendErrorResponse(response, 500, 'Internal Server Error: Unable to update user.');
  }
  finally {
    const duration = Date.now() - startTime; // Calculate duration
    statsd.timing('api.update.user.response_time', duration); // Log API call duration
}

};

//deny other methods
export const userInvalidMethods = (request, response) => {
  const startTime = Date.now();
  statsd.increment('api.other.user.calls');
  logger.error({
    message: "Error: Method not allowed",
    httpRequest: {
        requestMethod: request.method,
        requestUrl: request.originalUrl,
        status: 405,
    }
})
const duration = Date.now() - startTime; // Calculate duration
  statsd.timing('api.other.user.response_time', duration); // Log API call duration
  return sendErrorResponse(response, 405, 'Method not allowed');
  
};


export const uploadPic = async (request, response) => {
 // const userId = request.headers['user-id']; // Assuming user ID is provided in headers
  const file = request.file;
  const startTime = Date.now();
  statsd.increment('api.post.userimg.calls');
  
   const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
   if (!file || !validMimeTypes.includes(file.mimetype)) {
   console.log('error');
    logger.error({
      message: "Error: Bad Request",
      httpRequest: {
          error: error,
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 400,
      }
  })
    sendErrorResponse(response, 400, 'Bad Request');
    return;
}     
 
 
  const dbConnection = await checkDbConnection();

  if (!dbConnection) {
    logger.error({
      message: "Error: Service Unavailable",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 503,
      }
  })
    sendErrorResponse(response, 503, 'Service Unavailable');
    return;
  } else {
    try {
      
      const authorizationHeader = request.headers.authorization;
      const user =request.user;
    
      //Unauthorized user
      if (!authorizationHeader) {
        logger.error({
          message: "Error: Missing Authorization field",
          httpRequest: {
              requestMethod: request.method,
              requestUrl: request.originalUrl,
              status: 400,
          }
      })
        sendErrorResponse(response, 400, 'Missing Authorization field');
        return;
      }

  if (!user || !file) {
    logger.error({
      message: "User ID and file are required",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 400,
      }
  })
    return response.status(400).json({ error: 'User ID and file are required' });
  }

  try {
    const existingImage = await Image.findOne({ where: { user_id: user.id } });

    if (existingImage) {
      logger.error({
        message: "Bad Request",
        httpRequest: {
            requestMethod: request.method,
            requestUrl: request.originalUrl,
            status: 400,
        }
    })

    return response.status(400).json({ error: 'Bad Request' });
    }

    const startDTime = Date.now();



    // Upload file to S3
    statsd.increment('db.create_userimg.call');
    const s3Key = await s3Service.uploadFile(file, user.id);
    // const url = `${process.env.S3_BUCKET_NAME}/${s3Key}`
    const url = `${s3Key.Location}`
    

    // Store image metadata in the database
    const newImage = await Image.create({
      file_name: file.originalname,
      url: url,
      user_id: user.id,
    });

    const imgData = newImage.toJSON();

    logger.info({
      message: "INFO:Image uploaded successfully",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 201,
      }
  })
    // response.status(201).json({
    //   imgData
    // });
    statsd.timing('db.create_userimg.query_time', Date.now()- startDTime);
    return sendSuccessResponse(response, 201, imgData);
  } catch (error) {
    console.error('Error uploading image:', error);
    logger.error({
      message: "Error: Failed to upload image",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 500,
      }
  })
    //response.status(500).json({ error: 'Failed to upload image' });
    sendErrorResponse(response, 500, { error: 'Failed to upload image' })
  }
  finally {
    const duration = Date.now() - startTime; // Calculate duration
    statsd.timing('api.post.userimg.response_time', duration); // Log API call duration
}

}
catch(error){
  console.error('Error uploading image:', error);
  logger.error({
    message: "Error: Failed to upload image",
    httpRequest: {
        requestMethod: request.method,
        requestUrl: request.originalUrl,
        status: 500,
    }
})
  response.status(500).json({ error: 'Failed to upload image' });
}
finally {
  const duration = Date.now() - startTime; // Calculate duration
  statsd.timing('api.post.userimg.response_time', duration); // Log API call duration
}

  }
};

export const getPic = async (request, response) => {
  const startTime = Date.now();
  statsd.increment('api.get.userimg.calls');
  const userId = request.user.id;
  var startDTime = Date.now();

  try {
    startDTime = Date.now();
    statsd.increment('db.get_userimg.calls');
    const imageRecord = await Image.findOne({ where: { user_id: userId } });
    statsd.timing('db.get_userimg.query_time', Date.now()- startDTime);
    if (!imageRecord){ 
      logger.error({
        message: "Error: Image not found",
        httpRequest: {
            requestMethod: request.method,
            requestUrl: request.originalUrl,
            status: 404,
        }
    })
      return response.status(404).json({ error: 'Image not found' });
    }
    // Generate presigned URL
    startDTime = Date.now();
    statsd.increment('db.get_userimg.calls');
    const url = await s3Service.getFileUrl(userId);
    const record = await Image.findOne({ where: { user_id: userId } });
    const imageData = record.toJSON();
    statsd.timing('db.get_userimg.query_time', Date.now()- startDTime);
    logger.info({
      message: "INFO: Generated presigned url",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 200,
      }
  })
    // response.status(200).json({
    //   imageData
    // });
    sendSuccessResponse(response, 200, imageData);
  } catch (error) {
    logger.error({
      message: "Error: Error generating presigned UR",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          error: error,
          status: 500,
      }
  })
    console.error('Error generating presigned URL:', error);
    response.status(500).json({ error: 'Failed to generate URL' });
  }
  finally {
    const duration = Date.now() - startTime; // Calculate duration
    statsd.timing('api.get.userimg.response_time', duration); // Log API call duration
}
};

export const deletePic = async (request, response) =>{
  const startTime = Date.now();
  statsd.increment('api.delete.userimg.calls');
  const userId = request.user.id;
  var startDTime = Date.now();
  try {
    startDTime = Date.now();
    statsd.increment('db.delete_userimg.call');
    const imageRecord = await Image.findOne({ where: { user_id: userId } });
    statsd.timing('db.delete_userimg.query_time', Date.now()- startDTime);
    if (!imageRecord){ 
      logger.error({
        message: "Error: Image not found",
        httpRequest: {
            requestMethod: request.method,
            requestUrl: request.originalUrl,
            status: 404,
        }
    })
      return response.status(404).json({ error: 'Image not found' });
    }
    // Delete from S3 and then remove database record
    statsd.increment('db.delete_userimg.call');
    await s3Service.deleteFile(userId);
    await imageRecord.destroy();
    statsd.timing('db.delete_userimg.query_time', Date.now()- startDTime);
    logger.info('image deleted successfully');
    logger.info({
      message: "INFO:Image deleted successfully",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          status: 204,
      }
  })
    //response.status(204).json({ message: 'Image deleted successfully' });
    return sendResponse(response, 204, '');

  } catch (error) {
    logger.error({
      message: "Error: Error deleting image",
      httpRequest: {
          requestMethod: request.method,
          requestUrl: request.originalUrl,
          error: error,
          status: 500,
      }
  })
    console.error('Error deleting image:', error);
    response.status(500).json({ error: 'Failed to delete image' });
  }
  finally {
    const duration = Date.now() - startTime; // Calculate duration
    statsd.timing('api.delete.userimg.response_time', duration); // Log API call duration
}
};

export const verifyUserEmail = async (request, response) =>{
  const startTime = Date.now();
  statsd.increment('api.verify.useremail.calls');
  const token = request.query.token;
  console.log("tOKEN");
  console.log(token);

  if (!token) {
    return sendErrorResponse(response, 400, 'Token is required.');
  }
  const startDTime = Date.now();
  try{
    const tokenRecord = await Token.findOne({ where: { token } });
    if (!tokenRecord) {
    statsd.timing('db.verify_useremail.query_time', Date.now()- startDTime);
      return sendErrorResponse(response, 400, 'Invalid or expired token.');
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
    statsd.timing('db.verify_useremail.query_time', Date.now()- startDTime);
      return sendErrorResponse(response, 400, 'Token has expired.');
    }

    // Fetch the associated user
    const user = await User.findByPk(tokenRecord.userId);
    if (!user) {
    statsd.timing('db.verify_useremail.query_time', Date.now()- startDTime);
      return sendErrorResponse(response, 404, 'User not found.');
    }

    
    user.verified = true;
    await user.save();

    // Delete the token to prevent reuse
    // await tokenRecord.destroy();
    statsd.timing('db.verify_useremail.query_time', Date.now()- startDTime);

    return sendSuccessResponse(response, 200, {
      message: 'Email verified successfully.',
    });
  } catch(error){
    console.error('Error verifying user:', error);
    return sendErrorResponse(response, 500, 'Internal Server Error.');
  }
  finally{
    const duration = Date.now() - startTime; // Calculate duration
    statsd.timing('api.verify.useremail.response_time', duration); // Log API call duration
  }

};
