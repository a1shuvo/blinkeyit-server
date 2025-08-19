const verifyEmailTemplate = ({ name, url }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <p style="font-weight: bold; font-size: 16px;">Dear ${name},</p>
      <p style="font-size: 14px; line-height: 1.5;">
        Thank you for registering on <strong>Blinkeyit</strong>! Please verify your email by clicking the button below.
      </p>
      <a href="${url}" 
         target="_blank" 
         rel="noopener noreferrer"
         style="
           display: inline-block;
           padding: 12px 25px;
           color: white;
           background-color: #007BFF;
           text-decoration: none;
           border-radius: 5px;
           font-weight: bold;
           font-size: 16px;
           margin-top: 15px;
           text-align: center;
         ">
        Verify Email
      </a>
      <p style="font-size: 12px; color: #666; margin-top: 20px;">
        If you did not create an account, please ignore this email.
      </p>
    </div>
  `;
};

export default verifyEmailTemplate;
