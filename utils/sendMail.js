const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: `E-Com <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: text,
  };
  await transporter.verify();
  await transporter.sendMail(mailOptions);
  //   await
};

module.exports = sendMail;
