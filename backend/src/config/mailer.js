const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // port 465 uses SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

async function sendOtpEmail(toEmail, otp) {
  await transporter.sendMail({
    from: `"Marketplace" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your verification code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
}

module.exports = { sendOtpEmail };