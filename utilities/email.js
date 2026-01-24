const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/index.env" });

const transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  host: process.env.SERVICE,
  port: 465,
  auth: {
    user: process.env.USEREMAIL,
    pass: process.env.EMAILPASS,
  },
  secure: true,
});

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.USEREMAIL,
      to: to,
      subject: subject,
      html: html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { transporter, sendEmail };
