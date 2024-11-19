
import  express  from 'express';
import * as userController from '../controllers/userController.js';
import authenticate from '../utils/authenticator.js';
import verify from '../utils/verification.js';

const userRoutes = express.Router();

/**
 * @route   POST /users
 * @desc    Create a new user account
 * @access  Public
 */
//Stop head
userRoutes.head('', userController.userInvalidMethods);

userRoutes.post('', userController.createUser);

userRoutes.all('', userController.userInvalidMethods);

/**
 * @route   PUT /users/me
 * @desc    Update the authenticated user's account information
 * @access  Private (Requires Basic Authentication)
 */
userRoutes.put('/self', authenticate, verify, userController.updateUser);


/**
 * @route   GET /users/me
 * @desc    Get the authenticated user's account information
 * @access  Private (Requires Basic Authentication)
 */
 userRoutes.get('/self', authenticate, verify, userController.getUser);



export default userRoutes;