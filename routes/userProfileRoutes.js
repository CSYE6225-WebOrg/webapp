
import  express  from 'express';
import * as userController from '../controllers/userController.js';
import authenticate from '../utils/authenticator.js';
import verify from '../utils/verification.js';
import multer from 'multer';

const userProfileRoutes = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024}
});


/**
 * @route   PUT /v1/user/self
 * @desc    Update the authenticated user's account information
 * @access  Private (Requires Basic Authentication)
 */

//Stop head
userProfileRoutes.head('', userController.userInvalidMethods);

userProfileRoutes.put('', authenticate, verify, userController.updateUser);


/**
 * @route   GET /v1/user/self
 * @desc    Get the authenticated user's account information
 * @access  Private (Requires Basic Authentication)
 */
 userProfileRoutes.get('', authenticate, verify, userController.getUser);

 userProfileRoutes.all('', userController.userInvalidMethods);

/**
 * @route 
 * 
 */
userProfileRoutes.head('/pic', userController.userInvalidMethods);
userProfileRoutes.post('/pic', authenticate, verify, upload.single('file'), userController.uploadPic);

userProfileRoutes.get('/pic', authenticate,verify, userController.getPic);

userProfileRoutes.delete('/pic', authenticate,verify, userController.deletePic);

userProfileRoutes.all('/pic', userController.userInvalidMethods);

export default userProfileRoutes;