/**
 * Utility: generateOtp
 * --------------------
 * Generates a random 6-digit OTP (100000 - 999999).
 *
 * @returns {number} A 6-digit OTP
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export default generateOtp;
