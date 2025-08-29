/**
 * Template: Forgot Password Email
 * --------------------------------
 * Generates a password reset email template with OTP.
 * Accepts user's name and OTP, then returns a styled HTML string.
 */

const forgotPasswordTemplate = ({ name, otp }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
      <p style="font-weight: bold; font-size: 16px;">Dear ${name},</p>
      
      <p style="font-size: 14px; line-height: 1.6;">
        You have requested to reset your password. Please use the following OTP to proceed:
      </p>
      
      <div style="background: #f4f4f4; border: 1px solid #ddd; border-radius: 6px; 
                  font-size: 22px; padding: 15px; text-align: center; font-weight: bold; color: #000;">
        ${otp}
      </div>
      
      <p style="font-size: 13px; color: #555; margin-top: 20px; line-height: 1.5;">
        This OTP is valid for <strong>1 hour only</strong>. Enter this OTP on the Blinkeyit website to reset your password.
      </p>
      
      <p style="font-size: 13px; color: #555; margin-top: 20px;">
        Thanks,<br/>
        <strong>Blinkeyit Team</strong>
      </p>
    </div>
  `;
};

export default forgotPasswordTemplate;
