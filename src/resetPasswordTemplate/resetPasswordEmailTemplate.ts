export const resetPasswordEmailTemplate = (name: string, resetLink: string) => {
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
      .btn {
        display: inline-block;
        background: #e53935;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <h2 style="text-align:center;">Reset Password</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Click the button below:</p>

      <div style="text-align:center;margin:20px 0;">
        <a href="${resetLink}" class="btn">Reset Password</a>
      </div>

      <p>This link will expire soon for security reasons.</p>

      <p style="font-size:12px;color:#777;text-align:center;">
        If you didn’t request this, ignore this email.
      </p>
    </div>
  </body>
  </html>
  `;
};