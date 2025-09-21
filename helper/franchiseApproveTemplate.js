// resetPassword.js
module.exports = (franchise, tempPassword) => {
  const textMessage  =`
Hello ${franchise.name},

Your franchise application has been approved!

You can now log in using:

Email: ${franchise.email}
Temporary Password: ${tempPassword}

Please log in and change your password immediately.

Regards,
Admin
    `;

  const htmlMessage = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f5; padding:20px;">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
            
            <!-- Header with Logo -->
            <tr>
              <td style="background:#007bff; padding:20px; text-align:center;">
                <img src="http://localhost:5173/eonestep/src/assets/logo.png" alt="EoneStep" width="120" style="display:block; margin:0 auto;" />
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:30px; color:#333;">
                <h2 style="margin-top:0; color:#007bff;">Hello ${franchise.name},</h2>
                <p>Your franchise application <br/>has been approved!</b>.</p>
                <p>You can now log in using:</p>
                <p><b>Email:</b> ${franchise.email}<br/>
                <b>Temporary Password:</b> ${tempPassword}</p>
                <p>Please log in and change your password immediately.</p>
            
                
                <p style="margin-top:30px;">Regards,<br/>Admin</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f0f0f0; padding:15px; text-align:center; font-size:12px; color:#888;">
                &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  return { text: textMessage, html: htmlMessage };
};
