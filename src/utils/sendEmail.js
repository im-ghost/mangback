const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter (Using Gmail as an example)
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use an "App Password" from Google
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: `Disability Job App <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: `<b>${options.message}</b>` // You can use HTML for better design
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;