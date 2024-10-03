import auth from 'basic-auth';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { sendErrorResponse } from '../controllers/responseHandler.js';

/**
 * authenticate - Middleware to authenticate users using Basic Auth.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticate = async (req, res, next) => {
  const credentials = auth(req);
  // console.log('Credentials', credentials);

  if (!credentials || !credentials.name || !credentials.pass) {
    return sendErrorResponse(res, 401, 'Authentication required.');
  }

  try {
    const user = await User.findOne({ where: { email: credentials.name } });

    if (!user) {
      return sendErrorResponse(res, 401, 'Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(credentials.pass, user.password);

    if (!isPasswordValid) {
      return sendErrorResponse(res, 401, 'Invalid credentials.');
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return sendErrorResponse(res, 500, 'Internal Server Error: Authentication failed.');
  }
};

export default authenticate;