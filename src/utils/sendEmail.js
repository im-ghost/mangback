const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter (Using Gmail as an example)
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: `MANG MANG <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<b>${options.message}</b>` 
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;