import express from 'express';
import healthRoutes from './healthCheckRoutes.js';
import userRoutes from './userRoutes.js';
import userProfileRoutes from './userProfileRoutes.js';
import verifyRoutes from './verifyRoutes.js';
import { sendErrorResponse } from '../controllers/responseHandler.js';


const router = express.Router();

// Integrate health check routes
router.use('/healthz', healthRoutes);

// Integrate user-related routes
router.use('/v1/user', userRoutes);

//Integrate user-pic related routes
router.use('/v2/user/self', userProfileRoutes)

// Integrate health check routes
router.use('/verify', verifyRoutes);

/**
 * @route   ALL *
 * @desc    Handle undefined routes
 * @access  Public
 */
router.all('*', (request, response) => {
  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('X-Content-Type-Options', 'nosniff');


  return sendErrorResponse(response, 404, 'Invalid request');
});

export default router;