// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text,html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use SMTP config
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

try{
    await transporter.sendMail({
    from: `"Computer Institute" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
}catch(error){
  console.log("send email error",error)
}
};

module.exports = sendEmail;
