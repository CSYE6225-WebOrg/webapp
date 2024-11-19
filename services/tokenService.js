import crypto from 'crypto';
import Token from '../models/token.js';

/**
 * Generate a unique verification token and save it to the database.
 * 
 * @param {string} userId - The ID of the user.
 * @returns {string} The generated verification link.
 */
export const generateVerificationToken = async (userId) => {
  try {
    // Generate a token
    const token = crypto.randomBytes(16).toString('hex');

    // Calculate expiration time (2 minutes from now)
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Save the token to the database
    await Token.create({
      userId,
      token,
      expiresAt,
    });

    // Generate the verification link
    const verificationLink = `${process.env.BASE_URL}/verify?token=${token}`;

    return verificationLink;
  } catch (error) {
    console.error('Error generating verification token:', error);
    throw new Error('Failed to generate verification token');
  }
};

export default{
    generateVerificationToken
};