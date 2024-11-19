import User from '../models/user.js';
import { sendErrorResponse } from '../controllers/responseHandler.js';

 const verify = async (req, res, next) => {
    const user = req.user; // Assuming user is set in the request by authentication middleware
  
    if (!user || !user.verified) {
      return sendErrorResponse(res, 403, 'Account is not verified.');
    }
  
    next();
  };

export default verify;