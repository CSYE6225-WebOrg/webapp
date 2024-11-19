import  express  from 'express';
import * as userController from '../controllers/userController.js';
const verifyRoutes = express.Router();


verifyRoutes.head('', userController.userInvalidMethods);
verifyRoutes.get('', userController.verifyUserEmail);
verifyRoutes.all('', userController.userInvalidMethods);


export default verifyRoutes;