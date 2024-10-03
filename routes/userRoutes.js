
import  express  from 'express';
import * as userController from '../controllers/userController.js';
import authenticate from '../utils/authenticator.js';

const userRoutes = express.Router();

/**
 * @route   POST /users
 * @desc    Create a new user account
 * @access  Public
 */
userRoutes.post('', userController.createUser);

/**
 * @route   PUT /users/me
 * @desc    Update the authenticated user's account information
 * @access  Private (Requires Basic Authentication)
 */
userRoutes.put('', authenticate, userController.updateUser);
//Stop head
userRoutes.head('', authenticate, userController.userInvalidMethods);

/**
 * @route   GET /users/me
 * @desc    Get the authenticated user's account information
 * @access  Private (Requires Basic Authentication)
 */
 userRoutes.get('', authenticate, userController.getUser);

 userRoutes.all('', userController.userInvalidMethods);

export default userRoutes;