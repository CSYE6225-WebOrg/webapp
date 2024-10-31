
import  express  from 'express';
import * as userController from '../controllers/userController.js';
import authenticate from '../utils/authenticator.js';
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

userProfileRoutes.put('', authenticate, userController.updateUser);


/**
 * @route   GET /v1/user/self
 * @desc    Get the authenticated user's account information
 * @access  Private (Requires Basic Authentication)
 */
 userProfileRoutes.get('', authenticate, userController.getUser);

 userProfileRoutes.all('', userController.userInvalidMethods);

/**
 * @route 
 * 
 */
userProfileRoutes.head('/pic', userController.userInvalidMethods);
userProfileRoutes.post('/pic', authenticate, upload.single('file'), userController.uploadPic);

userProfileRoutes.get('/pic', authenticate, userController.getPic);

userProfileRoutes.delete('/pic', authenticate, userController.deletePic);

userProfileRoutes.all('/pic', userController.userInvalidMethods);

export default userProfileRoutes;