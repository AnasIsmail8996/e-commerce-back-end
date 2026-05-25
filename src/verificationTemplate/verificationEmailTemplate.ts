export const verificationEmailTemplate = (name: string, otp: string) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      .box {
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        padding: 20px;
        border-radius: 8px;
        font-family: Arial;
      }
      .otp {
        display: inline-block;
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 20px;
        letter-spacing: 4px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <h2 style="text-align:center;">Email Verification</h2>
      <p>Hi ${name},</p>
      <p>Your OTP for email verification is:</p>

      <div style="text-align:center;margin:20px 0;">
        <span class="otp">${otp}</span>
      </div>

      <p>This OTP is valid for a limited time.</p>
      <p style="font-size:12px;color:#777;text-align:center;">
        If you didn’t request this, ignore this email.
      </p>
    </div>
  </body>
  </html>
  `;
};