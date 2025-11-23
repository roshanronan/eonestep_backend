// utils/sendEmail.js
require('dotenv').config()
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text,html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

try{
    await transporter.sendMail({
    from: `"EoneStep Academy" <${process.env.MAIL_USER}>`,
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
